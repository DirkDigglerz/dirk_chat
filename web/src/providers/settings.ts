import { MantineColor, MantineColorShade, MantineColorsTuple } from "@mantine/core";

export const defaultSettings: SettingsProps = {
  primaryColor:'dirk', 
  primaryShade: 9,
  customTheme: [
    "#f8edff",
    "#e9d9f6",
    "#d0b2e8",
    "#b588da",
    "#9e65cf",
    "#914ec8",
    "#8a43c6",
    "#7734af",
    "#692d9d",
    "#5c258b"
  ],
  // Add more default settings here
};


export type SettingsProps = {
  primaryColor: MantineColor;
  primaryShade: MantineColorShade;
  customTheme: MantineColorsTuple;
  // Add more settings here
};

import { create } from 'zustand'
import { isEnvBrowser } from "../utils/misc";
import { fetchNui } from "../utils/fetchNui";

const useSettings = create<SettingsProps & { fetchSettings: () => void }>((set) => ({
  primaryColor: defaultSettings.primaryColor,
  primaryShade: defaultSettings.primaryShade,
  customTheme: defaultSettings.customTheme,
  
  // Add a function to fetch settings
  fetchSettings: async () => {
    if (!isEnvBrowser()) {
      try {
        const data = await fetchNui('GET_SETTINGS');
        set(data as SettingsProps);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    } else {
      console.warn('SettingsProvider: Not fetching settings from NUI');
    }
  },
}));

export default useSettings;

// // Trigger the settings fetch on document load
// if (typeof window !== 'undefined') {
//   useSettings.getState().fetchSettings();
// }
