window.onload = function () {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="18.018" height="17.712" viewBox="0 0 18.018 17.712">
  <path id="Message-icon-098uyhgv" d="M12.894,15.31a6.422,6.422,0,0,1-8.132-1.659c.245.021.491.038.742.038.217,0,.431-.017.644-.033a5.388,5.388,0,0,0,6.613.549l2.066.66-.671-1.984a5.277,5.277,0,0,0,1.024-3.128,4.949,4.949,0,0,0-.027-.518A5.289,5.289,0,0,0,13.9,6.312a8.567,8.567,0,0,0,.08-1.1c0-.089-.011-.176-.014-.265a6.317,6.317,0,0,1,2.223,4.53c0,.092.006.184.006.278a6.3,6.3,0,0,1-.916,3.279l1.153,3.4ZM1.153,9.628a6.309,6.309,0,0,1-.916-3.28c0-.093,0-.185.006-.279a6.4,6.4,0,0,1,12.783.117c0,.054,0,.108,0,.162a6.4,6.4,0,0,1-9.486,5.558L0,13.033Zm5.48,2.056a5.364,5.364,0,0,0,5.378-5.336c0-.14-.006-.279-.018-.417a5.38,5.38,0,0,0-10.712-.1,4.932,4.932,0,0,0-.027.518A5.284,5.284,0,0,0,2.279,9.478l-.67,1.982L3.674,10.8A5.363,5.363,0,0,0,6.633,11.685Z" transform="translate(0.791 0.5)" stroke="rgba(255,255,255)" stroke-miterlimit="10" stroke-width="1"/>
</svg>
`;
  const applyStyles = () => {
    const chatbot = document.querySelector('#godman-chatbot');
    chatbot.style.border = 'none';
    chatbot.style.position = 'fixed';
    chatbot.style.flexDirection = 'column';
    chatbot.style.justifyContent = 'space-between';
    chatbot.style.boxShadow =
      'rgba(150, 150, 150, 0.2) 0px 10px 30px 0px, rgba(150, 150, 150, 0.2) 0px 0px 0px 1px';
    chatbot.style.zIndex = '17171717';
    chatbot.style.overflow = 'hidden';
    chatbot.style.left = 'unset';
    chatbot.style.display = 'none';
    if (window.innerWidth > 800) {
      chatbot.style.bottom = '5rem';
      chatbot.style.width = '100%';
      chatbot.style.minHeight = '80vh';
      chatbot.style.height = '300px';
      chatbot.style.borderRadius = '1rem';
      chatbot.style.right = '1rem';
      chatbot.style.maxWidth = '525px';
    } else {
      chatbot.style.right = '0';
      chatbot.style.bottom = '0';
      chatbot.style.minHeight = '80vh';
    }
  };

  // Call the function to apply styles initially
  applyStyles();

  // Re-apply styles when the window is resized
  //window.addEventListener('resize', applyStyles);

  const chatbotIcon = document.createElement('div');
  console.log('=>(iframe.js:45) chatbotIcon', chatbotIcon);
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
  chatbotIcon.innerHTML = svgString;
  chatbotIcon.style.display = 'flex';
  chatbotIcon.style.justifyContent = 'center';
  chatbotIcon.style.alignItems = 'center';

  // append the element to the body
  document.body.appendChild(chatbotIcon);

  chatbotIcon.addEventListener('click', () => {
    const chatbot = document.querySelector('#godman-chatbot');
    const displayChatbotProp = chatbot.style.display;
    if (displayChatbotProp !== 'none') {
      chatbot.style.display = 'none';
    } else {
      chatbot.style.display = 'flex';
    }
  });

  console.log('test');
};
