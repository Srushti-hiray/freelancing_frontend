import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  TextField,
  Box,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import ProjectDetails from '../components/ProjectDetails';
import useUserStore from '../stores/user';
import useProjectsStore from '../stores/projects';
import useFreelancersStore from '../stores/freelancers';
import useSkillsStore from '../stores/skills';
import { SnackbarContext } from '../context/SnackbarContext';
import { getProjects, createProject, updateProject, deleteProject } from '../api/projects';
import { getFreelancers } from '../api/users';
import { getSkills } from '../api/skills';
import { Project, Skill } from '../types';
import Grid from '@mui/material/Grid';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import MoneyIcon from '@mui/icons-material/Money';
import SearchIcon from '@mui/icons-material/Search';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import ViewIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';

function ClientDashboard() {
  const { user } = useUserStore();
  const { projects, setProjects } = useProjectsStore();
  const { freelancers, setFreelancers } = useFreelancersStore();
  const { skills } = useSkillsStore();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [projectForm, setProjectForm] = useState({ title: '', category: '', description: '', budget: '', deadline: '' });
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({ title: '', category: '', description: '', budget: '', deadline: '' });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (user?.role === 'client') {
      getProjects({ clientId: user.id }).then(({ data }) => setProjects(data));
    } else {
      getProjects().then(({ data }) => setProjects(data));
    }
    getSkills().then(({ data }) => useSkillsStore.getState().setSkills(data));
  }, [user]);

  const handleSearch = async () => {
    try {
      console.log('Searching with skills:', selectedSkills);
      const response = await getFreelancers(selectedSkills);
      console.log('Raw API Response:', response);
      // Make sure we're using the correct data from the response
      const freelancerData = response.data;
      console.log('Freelancer data to be set:', freelancerData);
      setFreelancers(freelancerData);
    } catch (error: any) {
      console.error('Search error:', error);
      showSnackbar(error.response?.data?.message || 'Search failed', 'error');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectData = {
        ...projectForm,
        budget: parseFloat(projectForm.budget),
        clientId: user!.id
      };
      const { data } = await createProject(projectData);
      setProjects([...projects, data]);
      setOpenProjectDialog(false);
      showSnackbar('Project created', 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Creation failed', 'error');
    }
  };

  const handleEditClick = (project: Project) => {
    setEditProject(project);
    setEditForm({
      title: project.title,
      category: project.category,
      description: project.description,
      budget: String(project.budget),
      deadline: project.deadline,
    });
    setOpenEditDialog(true);
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject) return;
    if (!user) return;
    try {
      const updateData = {
        title: editForm.title,
        category: editForm.category,
        description: editForm.description,
        budget: parseFloat(editForm.budget),
        deadline: editForm.deadline,
      };
      await updateProject(editProject.id, updateData);
      showSnackbar('Project updated', 'success');
      setOpenEditDialog(false);
      setEditProject(null);
      // Refresh projects
      getProjects({ clientId: user.id }).then(({ data }) => setProjects(data));
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      showSnackbar('Project deleted', 'success');
      // Refresh projects
      getProjects({ clientId: user.id }).then(({ data }) => setProjects(data));
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Box sx={{ 
        flexGrow: 1, 
        width: '100%', 
        px: { xs: 1, sm: 2 },
        pt: { xs: 2, md: 3 },
        pb: { xs: 2, md: 3 },
        maxWidth: { xs: '100%', md: 1200, lg: 1400 }, 
        mx: 'auto',
        ml: sidebarOpen ? '240px' : 0,
        transition: theme => theme.transitions.create(['margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}>
        {/* Hero Banner */}
        <Box sx={{
          mb: 4,
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(90deg, #1565c0 60%, #1976d2 100%)'
            : 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)',
          color: '#fff',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 3,
          gap: 3
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome to Your Client Dashboard!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Post projects, find talented freelancers, and get work done.
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <img 
              src="https://img.freepik.com/free-vector/business-team-putting-together-jigsaw-puzzle-isolated-flat-vector-illustration-cartoon-partners-working-connection-teamwork-partnership-cooperation-concept_74855-9814.jpg" 
              alt="Client Dashboard" 
              style={{ height: 120, borderRadius: 12, boxShadow: '0 4px 24px rgba(25, 118, 210, 0.15)' }} 
            />
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: 2,
              p: 2,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.2) 60%, rgba(25, 118, 210, 0.3) 100%)'
                : 'linear-gradient(135deg, #e3f2fd 60%, #bbdefb 100%)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WorkIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Active Projects</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>{projects.length}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: 2,
              p: 2,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.2) 60%, rgba(46, 125, 50, 0.3) 100%)'
                : 'linear-gradient(135deg, #e8f5e9 60%, #c8e6c9 100%)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MoneyIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total Budget</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                    ${projects.reduce((total, project) => total + Number(project.budget), 0).toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Create Project Button */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenProjectDialog(true)}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              px: 3, 
              py: 1.2,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)'
                : 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
              '&:hover': {
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #104c8c 30%, #1565c0 90%)'
                  : 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
              }
            }}
          >
            Create New Project
          </Button>
        </Box>

        {/* Main Content: Search Freelancers & Projects Table */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: 1, 
              p: 2,
              bgcolor: 'background.paper',
              transition: 'box-shadow 0.2s', 
              '&:hover': { boxShadow: 4 } 
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Search Freelancers</Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Skills</InputLabel>
                    <Select
                      multiple
                      value={selectedSkills}
                      onChange={(e) => setSelectedSkills(e.target.value as string[])}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" color="primary" />
                          ))}
                        </Box>
                      )}
                    >
                      {skills.map((skill) => (
                        <MenuItem key={skill.id} value={skill.name}>{skill.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                    sx={{ minWidth: 140, borderRadius: 2, alignSelf: { xs: 'stretch', sm: 'center' } }}
                  >
                    Search
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Skills</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {freelancers && freelancers.length > 0 ? (
                        freelancers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((freelancer) => (
                          <TableRow key={freelancer.id}>
                            <TableCell>{freelancer.name}</TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                {Array.isArray(freelancer.skills) && freelancer.skills.map((skill) => (
                                  <Chip key={skill} label={skill} size="small" color="primary" />
                                ))}
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => navigate(`/users/${freelancer.id}`)}
                                sx={{ borderRadius: 2 }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            No freelancers found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={freelancers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Projects Table */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: 1, 
              p: 2,
              bgcolor: 'background.paper',
              transition: 'box-shadow 0.2s', 
              '&:hover': { boxShadow: 4 } 
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Your Projects</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Budget</TableCell>
                        <TableCell>Deadline</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell>{project.title}</TableCell>
                          <TableCell>
                            <Chip label={project.category} size="small" color="primary" />
                          </TableCell>
                          <TableCell>${project.budget.toLocaleString()}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              {project.deadline}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={() => setSelectedProject(project)} color="primary">
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Project">
                                <IconButton size="small" onClick={() => handleEditClick(project)} color="primary">
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Project">
                                <IconButton size="small" onClick={() => handleDeleteProject(project.id)} color="error">
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Dialogs remain unchanged */}
        {selectedProject && (
          <ProjectDetails project={selectedProject} setSelectedProject={setSelectedProject} />
        )}
        <Dialog 
          open={openProjectDialog} 
          onClose={() => setOpenProjectDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
            }
          }}
        >
          <DialogTitle>Create New Project</DialogTitle>
          <DialogContent>
            <form onSubmit={handleCreateProject}>
              <TextField
                label="Title"
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={projectForm.category}
                  onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                >
                  {['web-development', 'mobile', 'design', 'writing', 'marketing'].map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                multiline
                rows={4}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Budget"
                type="number"
                value={projectForm.budget}
                onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Deadline"
                type="date"
                value={projectForm.deadline}
                onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <Button type="submit" variant="contained" fullWidth>
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog 
          open={openEditDialog} 
          onClose={() => setOpenEditDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
            }
          }}
        >
          <DialogTitle>Edit Project</DialogTitle>
          <DialogContent>
            <form onSubmit={handleEditProject}>
              <TextField
                label="Title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  {['web-development', 'mobile', 'design', 'writing', 'marketing'].map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                multiline
                rows={4}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Budget"
                type="number"
                value={editForm.budget}
                onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Deadline"
                type="date"
                value={editForm.deadline}
                onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <Button type="submit" variant="contained" fullWidth>
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}

export default ClientDashboard;