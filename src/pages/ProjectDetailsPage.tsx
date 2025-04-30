import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Paper, Typography, Divider, Chip, CircularProgress } from '@mui/material';
import { getProjectById } from '../api/projects';
import { Project } from '../types';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await getProjectById(Number(id));
        setProject(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load project details');
        console.error('Error fetching project details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error || 'Project not found'}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            {project.title}
          </Typography>
          <Chip 
            label={project.category} 
            color="primary" 
            size="small" 
            sx={{ mr: 1 }}
          />
          <Chip 
            label={`$${project.budget}`} 
            color="success" 
            size="small" 
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {project.description}
          </Typography>
        </Box>

        <Box display="flex" flexWrap="wrap" gap={4}>
          <Box flex={1} minWidth={200}>
            <Typography variant="subtitle2" color="text.secondary">
              Budget
            </Typography>
            <Typography variant="h6">
              ${project.budget}
            </Typography>
          </Box>

          <Box flex={1} minWidth={200}>
            <Typography variant="subtitle2" color="text.secondary">
              Deadline
            </Typography>
            <Typography variant="h6">
              {new Date(project.deadline).toLocaleDateString()}
            </Typography>
          </Box>

          <Box flex={1} minWidth={200}>
            <Typography variant="subtitle2" color="text.secondary">
              Client
            </Typography>
            <Typography variant="h6">
              {project.client?.name || 'Anonymous'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectDetailsPage; 