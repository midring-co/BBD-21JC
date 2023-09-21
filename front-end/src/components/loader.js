import React from 'react';

import { Box } from '@mui/material';
import { CircularProgress } from '@mui/material';

const Loader = () => {
    return (
        <>
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
        >
            <CircularProgress color="secondary" />
        </Box>
        </>
    );
};

export default Loader;