export const generateIframeUtil = (chatbot_id: string) => {
  return `<iframe 
      src="${process.env.DOMAIN_NAME}/chatbot-iframe/${chatbot_id}"
      width="100%"
      style="height: 100%; min-height: 700px"
       id="godman-chatbot"
    ></iframe>
  `;
};
