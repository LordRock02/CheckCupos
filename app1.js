// Importing the NPM packages that we installed
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

import {busquedas,chats} from './data.js'

// Function starts here
async function getCupos(item) {
  try {
    // ESTA ES LA PARTE NUEVA:
    // Objeto con las cabeceras que simulan un navegador real
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    };

    // Y AQUÍ APLICAMOS EL CAMBIO:
    // Pasamos el objeto 'headers' a la petición fetch
    const response = await fetch(item.link, { headers: headers });

    // --- El resto de tu código sigue igual ---

    const body = await response.text();

    // Agregamos una comprobación por si la respuesta sigue siendo un error
    if (!response.ok) {
        console.error(`Error al acceder a ${item.nombreMateria}: ${response.status}`);
        console.error(body); // Muestra el HTML del error (ej. 403 Forbidden)
        return; // No continúa si hay error
    }

    const $ = cheerio.load(body);
    const nombreMateria = $('.nombreEspacio').text();
    
    // Si no encuentra el nombre, la página no cargó el contenido esperado
    if (!nombreMateria) {
        console.log(`Contenido no encontrado para ${item.nombreMateria}. La página puede estar protegida.`);
        return;
    }

    const horarios = [];

    $('tr[onmouseover]').map((index, fila) => {
      let nombreGrupo = $(fila).find('.cuadro_plano:nth-child(1)').text().replace(/\s/g, '');
      let cuposTotales = $(fila).find('.cuadro_plano:nth-child(9)').text().replace(/\s/g, '');
      let cuposDisponibles = $(fila).find('.cuadro_plano:nth-child(10)').text().replace(/\s/g, '');

      horarios.push({
        nombreGrupo,
        cuposTotales,
        cuposDisponibles
      });
    });

    let objeto = {nombreMateria, horarios};

    objeto.horarios.forEach((grupo)=>{
      if(parseInt(grupo.cuposDisponibles) > 0 && item.gruposBuscados.includes(grupo.nombreGrupo)){
        let mensaje = ``;
        mensaje += `Cupo disponible en: \n\n${objeto.nombreMateria}\n\n`;
        mensaje += `Grupo: ${grupo.nombreGrupo} \n`;
        mensaje += `Cupos totales: ${grupo.cuposTotales} \n`;
        mensaje += `Disponibles: ${grupo.cuposDisponibles}\n`;
        
        console.log("-----------------------------------------------------------------------------------------------------");

        var fechaHoraActual = new Date();
        var formatoFechaHora = new Intl.DateTimeFormat('es-CO', {
            timeZone: 'America/Bogota',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        }).format(fechaHoraActual);

        console.log(`\n${formatoFechaHora} \n`);
        console.log(mensaje);
        
        item.interesados.forEach((interesado)=>{
          const chat = chats.find((chat)=> chat.id == interesado);
          if (chat) {
            console.log("Enviando mensaje a : "+chat.nombre);
            enviarMensaje(chat.chatId, chat.token, mensaje);
          }
        });
        console.log("-----------------------------------------------------------------------------------------------------");
      }
    });
    
  } catch (error) {
    console.log(error);
  }
}


async function enviarMensaje(chatId,token,mensaje) {
  
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(mensaje)}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.ok) {
        console.log('Mensaje enviado con éxito.');
      } else {
        console.error('Error al enviar el mensaje:', data.description);
      }
    } catch (error) {
      console.error('Error de red:', error.message);
    }
  }

setInterval(() => {
  console.log("Ejecutando...")
    busquedas.forEach((item)=>{
        getCupos(item);
    })
    
}, 5000);