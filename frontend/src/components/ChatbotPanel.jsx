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
          bottom: 60,
          right: 80,
          backgroundColor: 'primary.main',
          color: 'white',
          width: 60,
          height: 60,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          '&:hover': {
            backgroundColor: 'primary.dark',
            transform: 'scale(1.1)',
            boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
          },
          transition: 'all 0.3s ease',
          display: isOpen ? 'none' : 'flex',
          zIndex: 1300,
        }}
      >
        <ChatIcon sx={{ fontSize: 30 }} />
      </IconButton>

      {/* Chat panel */}
      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          right: isOpen ? 80 : -400,
          bottom: 60,
          width: 350,
          height: 600,
          transition: 'right 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1300,
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
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
