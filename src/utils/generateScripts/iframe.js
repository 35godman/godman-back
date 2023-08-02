window.onload = function () {
  const chatbot = document.querySelector('#godman-chatbot');
  chatbot.style.border = 'none';
  chatbot.style.position = 'fixed';
  chatbot.style.flexDirection = 'column';
  chatbot.style.justifyContent = 'space-between';
  chatbot.style.boxShadow =
    'rgba(150, 150, 150, 0.2) 0px 10px 30px 0px, rgba(150, 150, 150, 0.2) 0px 0px 0px 1px';
  chatbot.style.bottom = '5rem';
  chatbot.style.right = '1rem';
  chatbot.style.width = '448px';
  chatbot.style.height = '85vh';
  chatbot.style.minHeight = '700px';
  chatbot.style.maxHeight = '824px';
  chatbot.style.borderRadius = '0.75rem';
  chatbot.style.display = 'flex';
  chatbot.style.zIndex = '2147483646';
  chatbot.style.overflow = 'hidden';
  chatbot.style.left = 'unset';

  const chatbotIcon = document.createElement('div');
  chatbotIcon.style.position = 'fixed';
  chatbotIcon.style.bottom = '1rem';
  chatbotIcon.style.right = '1rem';
  chatbotIcon.style.width = '50px';
  chatbotIcon.style.height = '50px';
  chatbotIcon.style.borderRadius = '25px';
  chatbotIcon.style.backgroundColor = 'rgb(0, 0, 0)';
  chatbotIcon.style.boxShadow = 'rgba(0, 0, 0, 0.2) 0px 4px 8px 0px';
  chatbotIcon.style.cursor = 'pointer';
  chatbotIcon.style.zIndex = '2147483645';
  chatbotIcon.style.transition = 'all 0.2s ease-in-out 0s';
  chatbotIcon.style.left = 'unset';

  // append the element to the body
  document.body.appendChild(chatbotIcon);

  chatbotIcon.addEventListener('click', () => {
    const displayChatbotProp = chatbot.style.display;
    console.log('=>(iframe.js:24) displayChatbotProp', displayChatbotProp);
    if (displayChatbotProp === 'block') {
      chatbot.style.display = 'none';
    } else {
      chatbot.style.display = 'block';
    }
  });

  console.log('Hello');
};
