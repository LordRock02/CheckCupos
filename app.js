// Importing the NPM packages that we installed
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

import {busquedas,chats} from './data.js'

// Function starts here
async function getCupos(item) {
  try {
    const response = await fetch(item.link);

    const body = await response.text();

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

    //console.log("Monitoreando: "+nombreMateria)

    // console.log(horarios)

    objeto.horarios.forEach((grupo)=>{
        if(true){
            console.log("prueba")
            let mensaje = ``;

            mensaje += `Cupo disponible en: \n\n${objeto.nombreMateria}\n\n`
            mensaje += `Grupo: ${grupo.nombreGrupo} \n`
            mensaje += `Cupos totales: ${grupo.cuposTotales} \n`
            mensaje += `Disponibles: ${grupo.cuposDisponibles}\n`

            

            console.log("-----------------------------------------------------------------------------------------------------")


            var fechaHoraActual = new Date();            
            // Obtener los componentes de la fecha y hora
            var año = fechaHoraActual.getFullYear();
            var mes = ('0' + (fechaHoraActual.getMonth() + 1)).slice(-2); // Sumar 1 porque los meses van de 0 a 11
            var dia = ('0' + fechaHoraActual.getDate()).slice(-2);
            var horas = ('0' + fechaHoraActual.getHours()).slice(-2);
            var minutos = ('0' + fechaHoraActual.getMinutes()).slice(-2);
            var segundos = ('0' + fechaHoraActual.getSeconds()).slice(-2);

            // Crear la cadena de fecha y hora en el formato deseado
            var formatoFechaHora = año + '-' + mes + '-' + dia + ' ' + horas + ':' + minutos + ':' + segundos;
            

            console.log(`\n${formatoFechaHora} \n`)


            console.log(mensaje)
            

            //Notificar a cada persona
            item.interesados.forEach((interesado)=>{
              const chat = chats.filter((chat)=> chat.id == interesado)
              
              console.log("Enviando mensaje a : "+chat[0].nombre)
                enviarMensaje(chat[0].chatId,chat[0].token,mensaje)
            })

            console.log("-----------------------------------------------------------------------------------------------------")
        }

        
    })

    // item.interesados.forEach((interesado)=>{

    //   const chat = chats.filter((chat)=> chat.id == interesado)
      
    //   console.log("Enviando mensaje a : "+chat[0].nombre)
    //   enviarMensaje(chat[0].chatId,chat[0].token,"Mensaje telegram materias")
    // })
    
  } catch (error) {
    console.log(error);
  }

  //console.log("--------------------------------------------------------------------------------------------------------------------------------------")
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
  chats.forEach((chat) => {
    enviarMensaje(chat.chatId, chat.token, `esto es una prueba ${chat.nombre}`)
  })
    
}, 5000);