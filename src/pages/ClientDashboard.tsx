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
      const { data } = await getFreelancers(selectedSkills);
      setFreelancers(data);
    } catch (error: any) {
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
    <div style={{ background: 'var(--background-color)', minHeight: '100vh' }}>
      <Sidebar />
      <div className="content">
        <Typography variant="h4" gutterBottom>
          Client Dashboard
        </Typography>
        <FormControl fullWidth margin="normal">
          <InputLabel>Skills</InputLabel>
          <Select
            multiple
            value={selectedSkills}
            onChange={(e) => setSelectedSkills(e.target.value as string[])}
            renderValue={(selected) => selected.join(', ')}
          >
            {skills.map((skill: Skill) => (
              <MenuItem key={skill.id} value={skill.name}>
                {skill.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSearch}>
          Search Freelancers
        </Button>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Skills</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {freelancers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((freelancer) => (
                <TableRow key={freelancer.id}>
                  <TableCell>{freelancer.name}</TableCell>
                  <TableCell>{freelancer.skills?.join(', ')}</TableCell>
                  <TableCell>
                    <Button onClick={() => navigate(`/users/${freelancer.id}`)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
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
        <Button variant="contained" onClick={() => setOpenProjectDialog(true)}>
          Create Project
        </Button>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Edit/Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.title}</TableCell>
                  <TableCell>{project.category}</TableCell>
                  <TableCell>{project.budget}</TableCell>
                  <TableCell>{project.deadline}</TableCell>
                  <TableCell>
                    <Button onClick={() => setSelectedProject(project)}>View</Button>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleEditClick(project)} color="primary">Edit</Button>
                    <Button onClick={() => handleDeleteProject(project.id)} color="error">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {selectedProject && (
          <ProjectDetails project={selectedProject} setSelectedProject={setSelectedProject} />
        )}
        <Dialog open={openProjectDialog} onClose={() => setOpenProjectDialog(false)}>
          <DialogTitle>Create Project</DialogTitle>
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
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
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
      </div>
    </div>
  );
}

export default ClientDashboard;