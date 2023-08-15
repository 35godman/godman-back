import {
  ChatbotSettings,
  ChatbotSettingsDocument,
} from '../schemas/chatbotSettings.schema';
import { chatbotStub } from './chatbot.stub';

export const chatbotSettingsStub = (): ChatbotSettingsDocument => {
  return {
    // chatbot_id: chatbotStub()._id,
    model: 'gpt-3.5-turbo',
    language: 'english',
    num_of_characters: 0,
    char_limit: 100000000,
    max_tokens: 1000,
    temperature: 0,
    base_prompt:
      "I want you to act as a document that I am having a conversation with. Your name is 'AI Assistant'. You will provide me with answers from the given info. If the answer is not included, say exactly 'Hmm, I am not sure.' and stop after that. Refuse to answer any question not about the info. Never break character.",
    visibility: 'private',
    domains: [],
    rate_limit: {
      messages_limit: 20,
      seconds: 30,
      limit_end_message: 'Limit ended',
    },
    customer_info: {
      title: 'Your title',
      name_checked: false,
      name: '',
      email_checked: false,
      email: '',
      phone_checked: false,
      phone: '',
    },
    initial_messages: [],
    suggested_messages: [],
    theme: 'light',
    profile_picture_path: `${process.env.BACKEND_DOMAIN_NAME}/static/icons/icons8-chatbot-96.png`,
    remove_profile_picture_checked: false,
    display_name: 'Chatbot',
    user_message_color: '#ffffff',
    bot_message_color: '#212432',
    footer_color: '#EDECEC',
    user_font_color: '#000000',
    bot_font_color: '#ffffff',
    chat_icon_path: 'static/icons/icons8-chatbot-96.png',
    chat_bubble_color: '#E3E5E8',
    show_initial_messages_timeout: 1000,
  } as unknown as ChatbotSettingsDocument;
};

export default chatbotSettingsStub;
