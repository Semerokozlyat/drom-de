import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import { ChakraProvider } from "@chakra-ui/react";
//import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import App from './App.tsx'
import './index.css'
//import activeTheme from "./chakra/theme.ts";

//const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App />
  </StrictMode>,
)
