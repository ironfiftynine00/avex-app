// Boot script to set up global environment before loading main application
(global as any).truncate = false;

// Import and run the main server
import "./index.js";