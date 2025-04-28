import { Card, CardContent, Typography, Button } from '@mui/material';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onView: () => void;
  onBid?: () => void;
}

function ProjectCard({ project, onView, onBid }: ProjectCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{project.title}</Typography>
        <Typography>Category: {project.category}</Typography>
        <Typography>Budget: ${project.budget}</Typography>
        <Typography>Deadline: {project.deadline}</Typography>
        <Button onClick={onView}>View</Button>
        {onBid && <Button onClick={onBid}>Bid</Button>}
      </CardContent>
    </Card>
  );
}

export default ProjectCard;