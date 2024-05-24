// Import the necessary plugins
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import nesting from '@tailwindcss/nesting';

// Export the configuration object
export default {
  plugins: [
    nesting(),
    tailwindcss,
    autoprefixer
  ]
};
