const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '5975679439:AAEKWPdlp8bsbPrJ5QiXv6ZdddXs5zz0MzE';
const webAppUrl = 'https://fluffy-duckanoo-03d141.netlify.app/';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start'){
        await bot.sendMessage(chatId, 'Заходи в магазин',{
            reply_markup:{
                inline_keyboard:[
                    [{text: 'Магазин', web_app: {url: webAppUrl}}]
                ]
            }
        });

        await bot.sendMessage(chatId, 'Заполните форму',{
            reply_markup:{
                keyboard: [
                    [{text: 'Заполнить форму',web_app: {url: webAppUrl + 'form'}}]
                ]
            }
        });
    }

    if(msg?.web_app_data?.data){
        try{
            const data = JSON.parse(msg?.web_app_data?.data)

            await bot.sendMessage(chatId,'Спасибо за обратную связь!');
            await bot.sendMessage(chatId,'Ваше имя: ' + data?.name);
            await bot.sendMessage(chatId,'Ваш номер: ' + data?.number);

            setTimeout(async() =>{
                await bot.sendMessage(chatId,'Всю информацию вы получили в этом чате');
            })
        }catch (e){
            console.log(e)
        }
    }

});

app.post('/web-data',async (req, res) => {
    const {queryId, products, totalPrice} = req.body;
    try{
        await bot.answerWebAppQuery(queryId,{
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {message_text: 'Вы приобрели товар на сумму ' + totalPrice}
        });
        return res.status(200).json({});
    }catch (e){
        await bot.answerWebAppQuery(queryId,{
            type: 'article',
            id: queryId,
            title: 'Не удалось приобрести товар',
            input_message_content: {message_text: 'Не удалось приобрести товар ' + totalPrice}
        });
        return res.status(500).json({});
    }
})

const PORT = 8000;

app.listen(PORT,() => console.log('server started on PORT ' + PORT))
