// Importamos los paquetes necesarios. Ahora usamos puppeteer.
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch'; // Importación añadida para asegurar compatibilidad
import { busquedas, chats } from './data.js';

async function getCupos(item) {
  let browser; // Definimos browser fuera del try para poder cerrarlo en el finally
  try {
    // 1. Lanzamos una instancia del navegador (CON LA CORRECCIÓN APLICADA)
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    // 2. Abrimos una nueva página
    const page = await browser.newPage();
    
    // Le decimos a la página que se "disfrace" de un navegador normal
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');

    // 3. Vamos a la URL. Puppeteer esperará a que se ejecute el JavaScript y ocurra la redirección.
    await page.goto(item.link, { waitUntil: 'networkidle0' }); // Espera a que la página esté completamente cargada

    // 4. Obtenemos el contenido HTML FINAL de la página
    const body = await page.content();

    const $ = cheerio.load(body);

    const nombreMateria = $('.nombreEspacio').text();
    const horarios = [];

    // Si no encuentra la materia, es porque el link expiró.
    if (!nombreMateria) {
      console.log(`\nAVISO: No se pudo obtener la materia para el link. Es muy probable que el enlace haya expirado. Por favor, actualízalo.`);
      await browser.close(); // Cerramos el navegador
      return;
    }

    console.log(`\nMonitoreando: ${nombreMateria.trim()}`);

    // ¡SELECTORES CORREGIDOS! Apuntamos a la tabla correcta y a las celdas 'td'.
    $('.contenidotabla tr[onmouseover]').map((index, fila) => {
      let nombreGrupo = $(fila).find('td:nth-child(1)').text().trim();
      let cuposTotales = $(fila).find('td:nth-child(9)').text().trim();
      let cuposDisponibles = $(fila).find('td:nth-child(10)').text().trim();

      // Hacemos una validación para asegurarnos de que estamos extrayendo números
      if (nombreGrupo && !isNaN(parseInt(cuposDisponibles))) {
        horarios.push({
          nombreGrupo,
          cuposTotales,
          cuposDisponibles
        });
      }
    });

    let objeto = { nombreMateria, horarios };

    objeto.horarios.forEach((grupo) => {
      if (parseInt(grupo.cuposDisponibles) > 0 && item.gruposBuscados.includes(grupo.nombreGrupo)) {
        let mensaje = ``;
        mensaje += `✅ ¡Cupo disponible encontrado! ✅\n\n`;
        mensaje += `Materia: ${objeto.nombreMateria.trim()}\n`;
        mensaje += `Grupo: ${grupo.nombreGrupo}\n`;
        mensaje += `Cupos totales: ${grupo.cuposTotales}\n`;
        mensaje += `Disponibles: ${grupo.cuposDisponibles}\n\n`;
        mensaje += `Link (puede expirar): ${item.link}`;

        item.interesados.forEach((interesado) => {
          const chat = chats.find((chat) => chat.id == interesado);
          if (chat) {
            console.log("Enviando mensaje a: " + chat.nombre);
            enviarMensaje(chat.chatId, chat.token, mensaje);
          }
        });
      }
    });

  } catch (error) {
    console.error("Ocurrió un error en getCupos:", error);
  } finally {
    // 5. Nos aseguramos de cerrar el navegador siempre, incluso si hay un error.
    if (browser) {
      await browser.close();
    }
  }
}

async function enviarMensaje(chatId, token, mensaje) {
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(mensaje)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.ok) {
      console.log('Mensaje de Telegram enviado con éxito.');
    } else {
      console.error('Error al enviar el mensaje de Telegram:', data.description);
    }
  } catch (error) {
    console.error('Error de red al enviar a Telegram:', error.message);
  }
}

// Se recomienda un intervalo más largo para no saturar el servidor.
setInterval(() => {
  busquedas.forEach((item) => {
    getCupos(item);
  });
}, 5000); // CORREGIDO a 60 segundos para evitar bloqueos