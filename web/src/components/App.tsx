import '@mantine/dates/styles.css';
import React, { useEffect, useState } from "react";
import "./App.css";
import Main from "./Main/main";
import { MantineProvider } from '@mantine/core';
import theme from '../theme';

import useSettings from '../providers/settings';



const App: React.FC = () => {
  const [curTheme, setCurTheme] = useState(theme);
  const settings = useSettings(state => state);
  // Ensure the theme is updated when the settings change
  useEffect(() => {
    const updatedTheme = {
      ...theme, // Start with the existing theme object
      colors: {
        ...theme.colors, // Copy the existing colors
        custom: settings.customTheme
      },
    };
    
    setCurTheme(updatedTheme);

    // set primary color
    setCurTheme({
      ...updatedTheme,
      primaryColor: settings.primaryColor,
      primaryShade: settings.primaryShade,
    });

  }, [settings]);


  return (
        
    <MantineProvider theme={curTheme} defaultColorScheme='dark'>
        <Main />
      
    </MantineProvider>
  );
};

export default App;
