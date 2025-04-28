import { useEffect, useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { Project, Bid, Message, ProjectFile, Milestone, Invoice } from '../types';
import useUserStore from '../stores/user';
import useBidsStore from '../stores/bids';
import useMessagesStore from '../stores/messages';
import useFilesStore from '../stores/files';
import useMilestonesStore from '../stores/milestones';
import useInvoicesStore from '../stores/invoices';
import { SnackbarContext } from '../context/SnackbarContext';
import MessageBubble from './MessageBubble';
import { sendMessage, getMessagesByProject } from '../api/messages';
import { uploadFile, getFilesByProject, downloadFile } from '../api/files';
import { createMilestone, getMilestonesByProject, updateMilestone } from '../api/milestones';
import { createInvoice, getInvoicesByMilestone, updateInvoice, downloadInvoice } from '../api/invoices';
import { getBidsByProject } from '../api/bids';
import { updateProject } from '../api/projects';
import { getProjectById } from '../api/projects';

interface ProjectDetailsProps {
  project: Project;
  setSelectedProject: (project: Project | null) => void;
}

function ProjectDetails({ project, setSelectedProject }: ProjectDetailsProps) {
  const { user } = useUserStore();
  const { bids, setBids } = useBidsStore();
  const { messages, setMessages } = useMessagesStore();
  const { files, setFiles } = useFilesStore();
  const { milestones, setMilestones } = useMilestonesStore();
  const { invoices, setInvoices } = useInvoicesStore();
  const [tab, setTab] = useState(0);
  const [messageForm, setMessageForm] = useState('');
  const [file, setFile] = useState<File | null>(null); // Browser File
  const [milestoneForm, setMilestoneForm] = useState({ title: '', dueDate: '', amount: '' });
  const [invoiceForm, setInvoiceForm] = useState<{ milestoneId: number; amount: number }>({ milestoneId: 0, amount: 0 });
  const [openMilestoneDialog, setOpenMilestoneDialog] = useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const { showSnackbar } = useContext(SnackbarContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'client') {
          const { data } = await getBidsByProject(project.id);
          setBids(data);
        }
        const { data: messagesData } = await getMessagesByProject(project.id);
        setMessages(messagesData);
        const { data: filesData } = await getFilesByProject(project.id);
        setFiles(filesData);
        const { data: milestonesData } = await getMilestonesByProject(project.id);
        setMilestones(milestonesData);
        
        // Fetch invoices for all milestones
        const invoicesData: Invoice[] = [];
        for (const milestone of milestonesData) {
          const { data } = await getInvoicesByMilestone(milestone.id);
          // Add milestone information to each invoice
          const invoicesWithMilestone = data.map((invoice: Invoice) => ({
            ...invoice,
            milestone: {
              id: milestone.id,
              title: milestone.title
            }
          }));
          invoicesData.push(...invoicesWithMilestone);
        }
        setInvoices(invoicesData);
      } catch (error: any) {
        showSnackbar(error.response?.data?.message || 'Data fetch failed', 'error');
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // Polling every 5 seconds
    return () => clearInterval(interval);
  }, [project.id, user?.role, setBids, setMessages, setFiles, setMilestones, setInvoices]);

  // Add a function to refresh the project data
  const refreshProjectData = async () => {
    try {
      const { data } = await getProjectById(project.id);
      setSelectedProject(data);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Failed to refresh project data', 'error');
    }
  };

  // Call refreshProjectData when the component mounts
  useEffect(() => {
    refreshProjectData();
  }, [project.id]);

  const handleSendMessage = async () => {
    try {
      if (!user?.id) {
        showSnackbar('User not found', 'error');
        return;
      }

      // Refresh project data before sending message to ensure we have latest state
      await refreshProjectData();

      // For clients, we need to find a freelancer to send the message to
      // If no freelancer is assigned yet, we can't send a message
      if (user.role === 'client') {
        const freelancerId = project.freelancerId || project.freelancer?.id;
        if (!freelancerId) {
          showSnackbar('No freelancer assigned to this project yet', 'error');
          return;
        }
        // Use freelancerId as the receiverId for client messages
        await sendMessage({ 
          projectId: project.id, 
          receiverId: freelancerId, 
          content: messageForm 
        });
      } else {
        // For freelancers, send to the client
        const clientId = project.client?.id || project.clientId;
        if (!clientId) {
          showSnackbar('Client information not found', 'error');
          return;
        }
        await sendMessage({ 
          projectId: project.id, 
          receiverId: clientId, 
          content: messageForm 
        });
      }
      
      setMessageForm('');
      const { data } = await getMessagesByProject(project.id);
      setMessages(data);
      showSnackbar('Message sent', 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Message failed', 'error');
      // Refresh project data on error to ensure we have latest state
      await refreshProjectData();
    }
  };

  const handleUploadFile = async () => {
    if (!file) {
      alert('No file selected');
      return;
    }
    await uploadFile(project.id, file);
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const milestoneData = {
        ...milestoneForm,
        projectId: project.id,
        amount: parseFloat(milestoneForm.amount)
      };
      const { data } = await createMilestone(milestoneData);
      setMilestones([...milestones, data]);
      setOpenMilestoneDialog(false);
      showSnackbar('Milestone created', 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Creation failed', 'error');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const invoiceData = {
        milestoneId: Number(invoiceForm.milestoneId),
        amount: Number(invoiceForm.amount)
      };
      const { data } = await createInvoice(invoiceData);
      setInvoices([...invoices, data]);
      setOpenInvoiceDialog(false);
      showSnackbar('Invoice created', 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Creation failed', 'error');
    }
  };

  const handleAssignFreelancer = async (freelancerId: number) => {
    try {
      // Show loading state
      showSnackbar('Assigning freelancer...', 'success');
      
      // Update the project on the server
      const { data: updatedProject } = await updateProject(project.id, { freelancerId });
      
      // Update the local project state
      setSelectedProject(updatedProject);
      
      // Refresh the bids list
      const { data: bidsData } = await getBidsByProject(project.id);
      setBids(bidsData);
      
      showSnackbar('Freelancer assigned successfully', 'success');
    } catch (error: any) {
      console.error('Assignment error:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to assign freelancer', 
        'error'
      );
      
      // Refresh project data on error
      try {
        const { data: refreshedProject } = await getProjectById(project.id);
        setSelectedProject(refreshedProject);
      } catch (refreshError) {
        console.error('Failed to refresh project:', refreshError);
      }
    }
  };

  const handleDownloadFile = async (fileId: number) => {
    try {
      const response = await downloadFile(fileId);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || `file-${fileId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download error:', error);
      showSnackbar(error.response?.data?.message || 'Download failed', 'error');
    }
  };

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      const response = await downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Download failed', 'error');
    }
  };

  return (
    <Dialog open={true} onClose={() => setSelectedProject(null)} fullWidth maxWidth="md">
      <DialogTitle>{project.title}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          {user?.role === 'client' && <Tab label="Bids" />}
          <Tab label="Messages" />
          <Tab label="Files" />
          <Tab label="Milestones" />
          <Tab label="Invoices" />
        </Tabs>
        {user?.role === 'client' && tab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Freelancer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bids.map((bid: Bid) => {
                  const assignedId = Number(project.freelancerId || project.freelancer?.id) || 0;
                  const isAssigned = assignedId === Number(bid.freelancerId);
                  console.log('Bid Row Debug:', {
                    assignedId,
                    bidFreelancerId: bid.freelancerId,
                    isAssigned,
                    projectFreelancerId: project.freelancerId,
                    projectFreelancerObjId: project.freelancer?.id
                  });
                  return (
                    <TableRow key={bid.id}>
                      <TableCell>{bid.freelancer?.name || `Freelancer ID: ${bid.freelancerId}`}</TableCell>
                      <TableCell>{bid.amount}</TableCell>
                      <TableCell>{bid.duration}</TableCell>
                      <TableCell>{bid.message}</TableCell>
                      <TableCell>
                        {assignedId === 0 ? (
                          <Button
                            onClick={() => handleAssignFreelancer(bid.freelancerId)}
                            style={{ backgroundColor: '#1976d2', color: 'white' }}
                          >
                            Assign
                          </Button>
                        ) : isAssigned ? (
                          <Button disabled style={{ backgroundColor: 'green', color: 'white' }}>
                            Assigned
                          </Button>
                        ) : (
                          <Button disabled style={{ backgroundColor: 'red', color: 'white' }}>
                            Not Assigned
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {tab === (user?.role === 'client' ? 1 : 0) && (
          <div>
            <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {messages.map((msg: Message) => (
                <MessageBubble key={msg.id} message={msg} isSent={msg.senderId === user?.id} />
              ))}
            </div>
            <TextField
              label="Message"
              value={messageForm}
              onChange={(e) => setMessageForm(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" onClick={handleSendMessage}>
              Send
            </Button>
          </div>
        )}
        {tab === (user?.role === 'client' ? 2 : 1) && (
          <div>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,application/msword"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ margin: '16px 0' }}
            />
            <Button variant="contained" onClick={handleUploadFile} disabled={!file}>
              Upload File
            </Button>
            <List>
              {files.map((file: ProjectFile) => (
                <ListItem key={file.id}>
                  <ListItemText primary={file.filePath.split('/').pop()} />
                  <Button onClick={() => handleDownloadFile(file.id)}>Download</Button>
                </ListItem>
              ))}
            </List>
          </div>
        )}
        {tab === (user?.role === 'client' ? 3 : 2) && (
          <div>
            {user?.role === 'client' && (
              <Button variant="contained" onClick={() => setOpenMilestoneDialog(true)}>
                Create Milestone
              </Button>
            )}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    {user?.role === 'client' && <TableCell>Action</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {milestones.map((milestone: Milestone) => (
                    <TableRow key={milestone.id}>
                      <TableCell>{milestone.title}</TableCell>
                      <TableCell>{milestone.dueDate}</TableCell>
                      <TableCell>{milestone.amount}</TableCell>
                      <TableCell>
                        {user?.role === 'client' ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={milestone.status}
                              onChange={async (e) => {
                                try {
                                  const newStatus = e.target.value as 'pending' | 'completed' | 'paid';
                                  await updateMilestone(milestone.id, { status: newStatus });
                                  setMilestones(
                                    milestones.map((m) =>
                                      m.id === milestone.id ? { ...m, status: newStatus } : m
                                    )
                                  );
                                  showSnackbar('Milestone status updated', 'success');
                                } catch (error: any) {
                                  showSnackbar(error.response?.data?.message || 'Update failed', 'error');
                                }
                              }}
                            >
                              <MenuItem value="pending">Pending</MenuItem>
                              <MenuItem value="completed">Completed</MenuItem>
                              <MenuItem value="paid">Paid</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography>{milestone.status}</Typography>
                        )}
                      </TableCell>
                      {user?.role === 'client' && (
                        <TableCell>
                          {milestone.status === 'completed' && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={async () => {
                                try {
                                  // Ensure amount is a valid number
                                  const amount = parseFloat(milestone.amount.toString());
                                  if (isNaN(amount)) {
                                    showSnackbar('Invalid amount value', 'error');
                                    return;
                                  }
                                  
                                  const invoiceData = {
                                    milestoneId: milestone.id,
                                    amount: amount
                                  };
                                  const { data } = await createInvoice(invoiceData);
                                  setInvoices([...invoices, data]);
                                  showSnackbar('Invoice created successfully', 'success');
                                } catch (error: any) {
                                  showSnackbar(error.response?.data?.message || 'Failed to create invoice', 'error');
                                }
                              }}
                            >
                              Create Invoice
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        {tab === (user?.role === 'client' ? 4 : 3) && (
          <div>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Milestone</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {invoice.milestone?.title || 'Unknown Milestone'}
                      </TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        {user?.role === 'client' ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={invoice.status}
                              onChange={async (e) => {
                                try {
                                  const newStatus = e.target.value as 'pending' | 'paid';
                                  await updateInvoice(invoice.id, { status: newStatus });
                                  setInvoices(
                                    invoices.map((inv) =>
                                      inv.id === invoice.id ? { ...inv, status: newStatus } : inv
                                    )
                                  );
                                  showSnackbar('Invoice status updated', 'success');
                                } catch (error: any) {
                                  showSnackbar(error.response?.data?.message || 'Update failed', 'error');
                                }
                              }}
                            >
                              <MenuItem value="pending">Pending</MenuItem>
                              <MenuItem value="paid">Paid</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography>{invoice.status}</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        <Dialog open={openMilestoneDialog} onClose={() => setOpenMilestoneDialog(false)}>
          <DialogTitle>Create Milestone</DialogTitle>
          <DialogContent>
            <form onSubmit={handleCreateMilestone}>
              <TextField
                label="Title"
                value={milestoneForm.title}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Due Date"
                type="date"
                value={milestoneForm.dueDate}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Amount"
                type="number"
                value={milestoneForm.amount}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, amount: e.target.value })}
                fullWidth
                margin="normal"
              />
              <Button type="submit" variant="contained" fullWidth>
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={openInvoiceDialog} onClose={() => setOpenInvoiceDialog(false)}>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogContent>
            <form onSubmit={handleCreateInvoice}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Milestone</InputLabel>
                <Select
                  value={invoiceForm.milestoneId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, milestoneId: Number(e.target.value) })}
                >
                  {milestones.map((milestone: Milestone) => (
                    <MenuItem key={milestone.id} value={milestone.id}>
                      {milestone.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Amount"
                type="number"
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                fullWidth
                margin="normal"
              />
              <Button type="submit" variant="contained" fullWidth>
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectDetails;