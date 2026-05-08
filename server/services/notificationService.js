/**
 * server/services/notificationService.js
 * Centralized service for all notifications (WhatsApp, etc.)
 */

export const createNotificationService = (config, helpers) => {
  const { 
    whatsappNotifyNumber, 
    whatsappPhoneNumberId, 
    whatsappAccessToken, 
    whatsappTemplateName 
  } = config;

  const { readCollection, writeCollection, nextId, capitalizePlan } = helpers;

  const hasWhatsAppCloudConfig = () => {
    return !!(whatsappPhoneNumberId && whatsappAccessToken);
  };

  const buildWhatsAppPayload = (message, target = whatsappNotifyNumber) => {
    if (whatsappTemplateName) {
      return {
        messaging_product: 'whatsapp',
        to: target,
        type: 'template',
        template: {
          name: whatsappTemplateName,
          language: { code: 'es_PE' },
          components: [{ type: 'body', parameters: [{ type: 'text', text: message.slice(0, 1024) }] }]
        }
      };
    }
    return {
      messaging_product: 'whatsapp',
      to: target,
      type: 'text',
      text: { preview_url: false, body: message.slice(0, 4096) }
    };
  };

  const sendWhatsAppTextMessage = async (message, target = whatsappNotifyNumber) => {
    const response = await fetch(`https://graph.facebook.com/v22.0/${whatsappPhoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${whatsappAccessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(buildWhatsAppPayload(message, target))
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message || 'WhatsApp text API error');
    return body;
  };

  const sendWhatsAppPhotoMessage = async (item) => {
    const response = await fetch(`https://graph.facebook.com/v22.0/${whatsappPhoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${whatsappAccessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: whatsappNotifyNumber,
        type: 'image',
        image: { link: item.photoUrl, caption: `${item.applicationCode} - ${item.fullName}` }
      })
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message || 'WhatsApp image API error');
    return body;
  };

  const buildDoctorApplicationMessage = (item) => {
    const scheduleSummary = Object.entries(item.schedules || {})
      .filter(([, slots]) => Array.isArray(slots) && slots.length)
      .map(([day, slots]) => `${day}: ${slots.join(', ')}`)
      .join(' | ');

    return [
      `Nueva solicitud de medico - ${item.applicationCode}`,
      `Fecha: ${new Date(item.createdAt).toLocaleString('es-PE')}`,
      `Plan seleccionado: ${capitalizePlan(item.plan)}`,
      `Nombre: ${item.fullName}`,
      `Especialidad: ${item.specialty}`,
      `CMP: ${item.cmp}`,
      `Ubicacion: ${item.department}, ${item.province}, ${item.district}`,
      `Clinica: ${item.clinic}`,
      `Experiencia: ${item.experience} años`,
      `Precio: S/ ${item.price}`,
      `Email: ${item.email}`,
      `WhatsApp medico: ${item.whatsapp}`,
      `Foto: ${item.photoUrl}`,
      `Horarios seleccionados: ${scheduleSummary || 'No definidos'}`
    ].join('\n');
  };

  const notifyDoctorApplication = async (item) => {
    const message = buildDoctorApplicationMessage(item);
    const notifications = await readCollection('notifications');

    if (hasWhatsAppCloudConfig()) {
      const photoResponse = item.photoPath?.startsWith('/uploads/')
        ? await sendWhatsAppPhotoMessage(item)
        : null;
      const textResponse = await sendWhatsAppTextMessage(message);
      const deliveredItem = {
        id: nextId('notify'),
        createdAt: new Date().toISOString(),
        target: whatsappNotifyNumber,
        delivered: true,
        mode: 'whatsapp-cloud-api',
        message,
        response: { photo: photoResponse, text: textResponse }
      };
      await writeCollection('notifications', [deliveredItem, ...notifications]);
      return deliveredItem;
    }

    const fallbackItem = {
      id: nextId('notify'),
      createdAt: new Date().toISOString(),
      target: whatsappNotifyNumber,
      delivered: false,
      mode: 'pending-config',
      message,
      waLink: `https://wa.me/${whatsappNotifyNumber}?text=${encodeURIComponent(message)}`
    };
    await writeCollection('notifications', [fallbackItem, ...notifications]);
    return fallbackItem;
  };

  const notifyDoctorReservation = async (appointment, doctor) => {
    const serviceName = appointment.patient.motivo || 'Consulta médica';
    
    const message = [
      `*NUEVA SOLICITUD DE CITA - MEDITRUJILLO*`,
      `Hola Dr(a). ${doctor.name}, mi nombre es ${appointment.patient.nombres} ${appointment.patient.apellidos}.`,
      `Le escribo a través de MedicoTrujillo porque me gustaría reservar el servicio de *${serviceName}*.`,
      ``,
      `*MIS DATOS:*`,
      `- DNI: ${appointment.patient.dni}`,
      `- Edad: ${appointment.patient.edad} años`,
      `- WhatsApp: https://wa.me/${appointment.patient.telefono.startsWith('51') ? appointment.patient.telefono : '51' + appointment.patient.telefono}`,
      `- Correo: ${appointment.patient.correo}`,
      ``,
      `*FECHA Y HORA SOLICITADA:*`,
      `- Fecha: ${appointment.appointmentDate} (${appointment.day})`,
      `- Hora: ${appointment.slot}`,
      ``,
      `Quedo a la espera de su confirmación. ¡Muchas gracias!`
    ].join('\n');

    const notifications = await readCollection('notifications');
    let targetNumber = doctor.whatsapp || whatsappNotifyNumber;
    if (/^9\d{8}$/.test(targetNumber)) targetNumber = `51${targetNumber}`;

    if (hasWhatsAppCloudConfig()) {
      const textResponse = await sendWhatsAppTextMessage(message, targetNumber);
      let adminResponse = null;
      if (targetNumber !== whatsappNotifyNumber) {
        try {
          adminResponse = await sendWhatsAppTextMessage(`*COPIA ADMINISTRADOR*\n\n${message}`, whatsappNotifyNumber);
        } catch (e) {
          console.error('Error enviando copia a admin:', e);
        }
      }
      const deliveredItem = {
        id: nextId('notify'),
        createdAt: new Date().toISOString(),
        target: targetNumber,
        delivered: true,
        mode: 'whatsapp-cloud-api',
        message,
        response: { text: textResponse, admin: adminResponse }
      };
      await writeCollection('notifications', [deliveredItem, ...notifications]);
      return deliveredItem;
    }

    const fallbackItem = {
      id: nextId('notify'),
      createdAt: new Date().toISOString(),
      target: targetNumber,
      delivered: false,
      mode: 'pending-config',
      message,
      waLink: `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`,
      adminWaLink: `https://wa.me/${whatsappNotifyNumber}?text=${encodeURIComponent('*COPIA ADMINISTRADOR*\n\n' + message)}`
    };
    await writeCollection('notifications', [fallbackItem, ...notifications]);
    return fallbackItem;
  };

  return {
    notifyDoctorApplication,
    notifyDoctorReservation,
    sendWhatsAppTextMessage,
    hasWhatsAppCloudConfig
  };
};
