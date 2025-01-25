import { Box, Paper, IconButton } from '@mui/material';
import { Chat as ChatIcon, Close as CloseIcon } from '@mui/icons-material';
import { useState } from 'react';

const ChatbotPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat button */}
      <IconButton
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          display: isOpen ? 'none' : 'flex',
        }}
      >
        <ChatIcon />
      </IconButton>

      {/* Chat panel */}
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          right: isOpen ? 20 : -400,
          bottom: 20,
          width: 350,
          height: 600,
          transition: 'right 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 1,
            backgroundColor: 'primary.main',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatIcon />
            Chat Assistant
          </Box>
          <IconButton
            size="small"
            onClick={() => setIsOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/IFMcrN5B3y9ruwFiqpN6j"
            width="100%"
            height="100%"
            frameBorder="0"
            title="Chatbot"
          />
        </Box>
      </Paper>
    </>
  );
};

export default ChatbotPanel;
