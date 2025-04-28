import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import ProjectDetails from '../components/ProjectDetails';
import useUserStore from '../stores/user';
import useProjectsStore from '../stores/projects';
import { SnackbarContext } from '../context/SnackbarContext';
import { getProjects} from '../api/projects';
import { createBid } from '../api/bids';
import { Project } from '../types';

function FreelancerDashboard() {
  const { user } = useUserStore();
  const { projects, setProjects } = useProjectsStore();
  const [filter, setFilter] = useState<{
    category: string;
    minBudget: string | number;
    maxBudget: string | number;
    minDeadline: string;
  }>({ category: '', minBudget: '', maxBudget: '', minDeadline: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectForBid, setSelectedProjectForBid] = useState<Project | null>(null);
  const [bidForm, setBidForm] = useState({ amount: '', duration: '', message: '' });
  const [openBidDialog, setOpenBidDialog] = useState(false);
  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!user) {
      showSnackbar('Please log in to continue', 'error');
      navigate('/login');
      return;
    }

    // Check if token exists
    const token = localStorage.getItem('access_token');
    if (!token) {
      showSnackbar('Authentication token missing. Please log in again', 'error');
      navigate('/login');
      return;
    }

    // Validate budget values
    const minBudget = filter.minBudget === '' ? undefined : Number(filter.minBudget);
    const maxBudget = filter.maxBudget === '' ? undefined : Number(filter.maxBudget);

    // Validate that budgets are valid numbers
    if ((minBudget !== undefined && isNaN(minBudget)) || (maxBudget !== undefined && isNaN(maxBudget))) {
      showSnackbar('Please enter valid budget values', 'error');
      return;
    }

    // Validate that budgets are not negative
    if ((minBudget !== undefined && minBudget < 0) || (maxBudget !== undefined && maxBudget < 0)) {
      showSnackbar('Budget values cannot be negative', 'error');
      return;
    }

    // Validate that minBudget is not greater than maxBudget
    if (minBudget !== undefined && maxBudget !== undefined && minBudget > maxBudget) {
      showSnackbar('Minimum budget cannot be greater than maximum budget', 'error');
      return;
    }

    // Validate deadline format if provided
    if (filter.minDeadline) {
      const date = new Date(filter.minDeadline);
      if (isNaN(date.getTime())) {
        showSnackbar('Please enter a valid deadline date', 'error');
        return;
      }
    }

    const params: {
      category?: string;
      minBudget?: number;
      maxBudget?: number;
      minDeadline?: string;
      freelancerId?: number;
    } = {};

    // Only add parameters if they have valid values
    if (filter.category) params.category = filter.category;
    if (minBudget !== undefined && !isNaN(minBudget) && minBudget >= 0) params.minBudget = minBudget;
    if (maxBudget !== undefined && !isNaN(maxBudget) && maxBudget >= 0) params.maxBudget = maxBudget;
    if (filter.minDeadline) params.minDeadline = filter.minDeadline;
    if (showCurrent && user.id) params.freelancerId = user.id;

    getProjects(params)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setProjects(response.data);
        } else {
          console.error('Invalid response format:', response);
          showSnackbar('Invalid response format from server', 'error');
        }
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
        if (error.response?.status === 401) {
          showSnackbar('Session expired. Please log in again', 'error');
          navigate('/login');
          return;
        }
        if (error.response?.status === 400) {
          const errorMessage = error.response.data?.message || 'Invalid parameters provided';
          showSnackbar(typeof errorMessage === 'string' ? errorMessage : errorMessage.join(', '), 'error');
          return;
        }
        const errorMessage = error.response?.data?.message || 'Failed to fetch projects';
        showSnackbar(errorMessage, 'error');
      });
  };

  // Helper function to validate date format
  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  // Initial load of projects
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      showSnackbar('Authentication token missing. Please log in again', 'error');
      navigate('/login');
      return;
    }

    getProjects({ ...(showCurrent && { freelancerId: user.id }) })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setProjects(response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
        if (error.response?.status === 401) {
          showSnackbar('Session expired. Please log in again', 'error');
          navigate('/login');
          return;
        }
        showSnackbar('Failed to fetch projects', 'error');
      });
  }, [user, showCurrent, setProjects, showSnackbar, navigate]);

  const handleBidSubmit = async (projectId: number) => {
    try {
      // Validate form values
      if (!bidForm.amount || !bidForm.duration) {
        showSnackbar('Please fill in all required fields', 'error');
        return;
      }

      // Convert to numbers and validate
      const amount = Number(bidForm.amount);
      const duration = Number(bidForm.duration);

      if (isNaN(amount) || amount <= 0) {
        showSnackbar('Amount must be a positive number', 'error');
        return;
      }

      if (isNaN(duration) || duration < 1) {
        showSnackbar('Duration must be at least 1 day', 'error');
        return;
      }

      const bidData = {
        projectId,
        amount,
        duration,
        message: bidForm.message
      };
      
      await createBid(bidData);
      setOpenBidDialog(false);
      showSnackbar('Bid submitted successfully', 'success');
      // Refresh projects after successful bid
      handleSearch();
    } catch (error: any) {
      console.error('Bid submission error:', error);
      showSnackbar(error.response?.data?.message || 'Failed to submit bid', 'error');
    }
  };

  return (
    <div style={{ background: 'var(--background-color)', minHeight: '100vh' }}>
      <Sidebar />
      <div className="content">
        <Typography variant="h4" gutterBottom>
          Freelancer Dashboard
        </Typography>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '24px' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              {['web-development', 'mobile', 'design', 'writing', 'marketing'].map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Min Budget"
            type="number"
            value={filter.minBudget}
            onChange={(e) => {
              const value = e.target.value;
              setFilter({ ...filter, minBudget: value === '' ? '' : parseFloat(value) });
            }}
            margin="normal"
            sx={{ width: '200px' }}
          />
          <TextField
            label="Max Budget"
            type="number"
            value={filter.maxBudget}
            onChange={(e) => {
              const value = e.target.value;
              setFilter({ ...filter, maxBudget: value === '' ? '' : parseFloat(value) });
            }}
            margin="normal"
            sx={{ width: '200px' }}
          />
          <TextField
            label="Min Deadline"
            type="date"
            value={filter.minDeadline}
            onChange={(e) => setFilter({ ...filter, minDeadline: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            sx={{ width: '200px' }}
          />
          <FormControlLabel
            control={<Checkbox checked={showCurrent} onChange={(e) => setShowCurrent(e.target.checked)} />}
            label="Show Current Projects"
            sx={{ marginTop: '16px' }}
          />
          <Button 
            variant="contained" 
            onClick={handleSearch}
            sx={{ marginTop: '16px', height: '56px' }}
          >
            Search
          </Button>
        </div>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.title}</TableCell>
                  <TableCell>{project.category}</TableCell>
                  <TableCell>{project.budget}</TableCell>
                  <TableCell>{project.deadline}</TableCell>
                  <TableCell>
                    {(project.freelancerId === user?.id || project.freelancer?.id === user?.id) && (
                      <Button onClick={() => setSelectedProject(project)}>View</Button>
                    )}
                    {!showCurrent && (
                      <Button
                        onClick={() => {
                          setBidForm({ amount: '', duration: '', message: '' });
                          setSelectedProjectForBid(project);
                          setOpenBidDialog(true);
                        }}
                      >
                        Bid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={projects.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
        {selectedProject && (
          <ProjectDetails project={selectedProject} setSelectedProject={setSelectedProject} />
        )}
        <Dialog open={openBidDialog} onClose={() => setOpenBidDialog(false)}>
          <DialogTitle>Submit Bid</DialogTitle>
          <DialogContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (selectedProjectForBid) {
                handleBidSubmit(selectedProjectForBid.id);
              }
            }}>
              <TextField
                label="Amount"
                type="number"
                value={bidForm.amount}
                onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Duration (days)"
                type="number"
                value={bidForm.duration}
                onChange={(e) => setBidForm({ ...bidForm, duration: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Message"
                value={bidForm.message}
                onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                multiline
                rows={4}
                fullWidth
                margin="normal"
              />
              <Button type="submit" variant="contained" fullWidth>
                Submit Bid
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default FreelancerDashboard;