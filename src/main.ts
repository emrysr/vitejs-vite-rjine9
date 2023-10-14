import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import EditorPlugin from './plugins/EditorPlugin.js';

const fields = new Map([
  ['email', 'E-mail'],
  ['full_name', 'Full Name'],
  ['job_title', 'Job Title'],
  ['company', 'Company'],
]);
const Props = {
  fields,
};
createApp(App, Props).use(EditorPlugin).mount('#app');
