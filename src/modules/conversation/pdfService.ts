import { Injectable } from '@nestjs/common';
import { ConversationDocument } from './conversation.schema';
import * as path from 'path';
const PDFDocument = require('pdfkit-table');

@Injectable()
export class PdfService {
  async generatePDF(conversations: ConversationDocument[]): Promise<Buffer> {
    const LIMIT = 50;
    conversations = conversations.slice(0, LIMIT);
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc
      .font(path.join(process.cwd(), 'static/fonts/pitagon-m.otf'))
      .fontSize(28);
    for (const conversation of conversations) {
      const messages = conversation.messages.map((message) => {
        return {
          role: {
            label: message.role,
            options: { fontSize: 10, fontFamily: 'PitagonSansMono-Medium' },
          },
          content: {
            label: message.content,
            options: { fontSize: 10, fontFamily: 'PitagonSansMono-Medium' },
          },
          source: {
            label: message.source,
            options: { fontSize: 6, fontFamily: 'PitagonSansMono-Medium' },
          },
          createdAt: {
            label: conversation.createdAt,
            options: { fontSize: 10, fontFamily: 'PitagonSansMono-Medium' },
          },
        };
      });
      const table = {
        title: conversation.conversation_id,
        headers: [
          { label: 'Role', property: 'role', width: 100, renderer: null },
          {
            label: 'Content',
            property: 'content',
            width: 200,
          },
          { label: 'Source', property: 'source', width: 100, renderer: null },
          { label: 'Date', property: 'createdAt', width: 100, renderer: null },
        ],
        // rows: messages,
        datas: messages,
      };
      await doc.table(table, {
        width: 500,
      });
    }

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }
}
