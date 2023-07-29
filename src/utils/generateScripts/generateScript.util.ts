export const generateScriptUtil = () => {
  return `<script src="${process.env.BACKEND_DOMAIN_NAME}/static/scripts/embed-script.js" defer></script>`;
};
