import { Typography, useTheme } from '@mui/material';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
}

function MessageBubble({ message, isSent }: MessageBubbleProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const bubbleStyle = {
    background: isSent
      ? theme.palette.primary.main
      : isDark
        ? '#333' // dark background for received
        : '#e0e0e0', // light background for received
    color: isSent
      ? '#fff'
      : isDark
        ? '#fff'
        : '#000',
    alignSelf: isSent ? 'flex-end' : 'flex-start',
    padding: 8,
    margin: 4,
    borderRadius: 8,
    maxWidth: '80%',
    wordBreak: 'break-word',
  } as React.CSSProperties;

  return (
    <div style={bubbleStyle}>
      <Typography>{message.content}</Typography>
      <Typography variant="caption">{new Date(message.createdAt).toLocaleString()}</Typography>
    </div>
  );
}

export default MessageBubble;