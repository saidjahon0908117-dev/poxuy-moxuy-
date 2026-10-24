const express = require('express');
const path = require('path');
const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
// Render avtomatik beradi: RENDER_EXTERNAL_URL. Qo'lda ham berish mumkin: WEBAPP_URL
const BASE_URL = (process.env.WEBAPP_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/$/, '');
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) { console.error('BOT_TOKEN topilmadi!'); process.exit(1); }

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_, res) => res.send('ok'));

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  if (!BASE_URL) return ctx.reply('WEBAPP_URL sozlanmagan.');
  return ctx.reply(
    '✨ Neon 3D qo‘l boshqaruvi\n\nTugmani bosing, kameraga ruxsat bering va qo‘lingiz bilan 3D neon shakllarni boshqaring.',
    Markup.inlineKeyboard([Markup.button.webApp('🚀 Ochish', BASE_URL)])
  );
});

bot.catch((err) => console.error('Bot xato:', err));

(async () => {
  if (BASE_URL) {
    // Webhook rejimi (Render uchun)
    const domain = BASE_URL.replace(/^https?:\/\//, '');
    app.use(await bot.createWebhook({ domain }));
    try {
      await bot.telegram.setChatMenuButton({
        menuButton: { type: 'web_app', text: 'Ochish', web_app: { url: BASE_URL } },
      });
    } catch (e) { console.log('Menu button o‘rnatilmadi:', e.message); }
    app.listen(PORT, () => console.log('Server + webhook:', BASE_URL));
  } else {
    // Lokal rejim
    app.listen(PORT, () => console.log('Lokal server :' + PORT));
    bot.launch();
  }
})();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
