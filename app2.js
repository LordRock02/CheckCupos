// Importing the NPM packages that we installed
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

import {busquedas, chats} from './data.js'

// Function starts here
async function getCupos(item) {
  try {
    console.log(`\n--- Realizando petición de diagnóstico a: ${item.link} ---\n`);
    const response = await fetch(item.link);
    const body = await response.text();

    // --- INICIO DE LA MODIFICACIÓN ---
    // Imprimimos el HTML completo que el script recibe para ver qué contiene.
    console.log("=== INICIO DEL CONTENIDO HTML RECIBIDO ===");
    console.log(body);
    console.log("=== FIN DEL CONTENIDO HTML RECIBIDO ===");
    // --- FIN DE LA MODIFICACIÓN ---


    /* HEMOS COMENTADO LA LÓGICA ORIGINAL PARA REALIZAR EL DIAGNÓSTICO.
      EL CÓDIGO DE ABAJO NO SE EJECUTARÁ.

      const $ = cheerio.load(body);
      const nombreMateria = $('.nombreEspacio').text();
      const horarios = [];

      $('tr[onmouseover]').map((index, fila) => {
          let nombreGrupo = $(fila).find('.cuadro_plano:nth-child(1)').text();
          nombreGrupo=nombreGrupo.replace(/\s/g, '');
          let cuposTotales = $(fila).find('.cuadro_plano:nth-child(9)').text();
          cuposTotales=cuposTotales.replace(/\s/g, '');
          let cuposDisponibles= $(fila).find('.cuadro_plano:nth-child(10)').text();
          cuposDisponibles=cuposDisponibles.replace(/\s/g, '');

        horarios.push({
          nombreGrupo,
          cuposTotales,
          cuposDisponibles
        });
      });

      let objeto = {nombreMateria,horarios}

      objeto.horarios.forEach((grupo)=>{
          if(parseInt(grupo.cuposDisponibles)>0 && item.gruposBuscados.includes(grupo.nombreGrupo)){
              let mensaje = ``;
              mensaje += `Cupo disponible en: \n\n${objeto.nombreMateria}\n\n`
              mensaje += `Grupo: ${grupo.nombreGrupo} \n`
              mensaje += `Cupos totales: ${grupo.cuposTotales} \n`
              mensaje += `Disponibles: ${grupo.cuposDisponibles}\n`
              
              console.log("-----------------------------------------------------------------------------------------------------")
              var fechaHoraActual = new Date();            
              var año = fechaHoraActual.getFullYear();
              var mes = ('0' + (fechaHoraActual.getMonth() + 1)).slice(-2);
              var dia = ('0' + fechaHoraActual.getDate()).slice(-2);
              var horas = ('0' + fechaHoraActual.getHours()).slice(-2);
              var minutos = ('0' + fechaHoraActual.getMinutes()).slice(-2);
              var segundos = ('0' + fechaHoraActual.getSeconds()).slice(-2);
              var formatoFechaHora = año + '-' + mes + '-' + dia + ' ' + horas + ':' + minutos + ':' + segundos;
              console.log(`\n${formatoFechaHora} \n`)
              console.log(mensaje)
              
              item.interesados.forEach((interesado)=>{
                const chat = chats.filter((chat)=> chat.id == interesado)
                console.log("Enviando mensaje a : "+chat[0].nombre)
                  enviarMensaje(chat[0].chatId,chat[0].token,mensaje)
              })
              console.log("-----------------------------------------------------------------------------------------------------")
          }
      })
    */
    
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
  console.log("Ejecutando script original en modo diagnóstico...");
  getCupos('https://estudiantes.portaloas.udistrital.edu.co/academicopro/index.php?index=RlUsXpODZrfht3nFH6Vx_SQXfFpFrphxZLEM9P-teMIwreBN2Uo-C89ewetKh2GLXLPvVOtWJLJP9D9atlm-yQ-g6G2tC1ewECm2GnRz-pLkoVOJNBZcsnDN5fe5hsF4Drq6VqOvSd4RPFZlNUnCO5o8AgO9WUo09O_kuybxOVrrW_FFKp44vT3HGYZOm7kpC9tosvZIcVwbxNAjQyJHWOZrH6BrErkmKmj5IlpgqrvEizSW9-S0g9QZ0_QqSpyB3ORibaKLH1rTaIGwpWzKX-Wat5B-raIQ2NaaTHhQ_TVBlIibAENvK8y__vSO0CkqGXlaKAdid-H3TCapM3zT2JhNwNz1I5tuSfoVsml4EXOu7wXDjlH8A1lq_wKKIvarBZXYoqbd76IIF8prSEumJb61wNU_gzq0OjsfFpjo-ZuicB1aWoWNfXlsB7PEhOqZr-jdeG2WcmeuMOO7D5Eo1jGbIjWFQGW554FD6GvJ2UKLgdJuDuAx6L5a-A6H5cxS');  
}, 5000);