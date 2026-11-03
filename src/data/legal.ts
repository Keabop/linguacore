// Legal documents of Voxie. They are written in Spanish, the language Mexican law asks for, and
// the app shows them in Spanish in both languages. A paragraph may hold [links](/ruta), plain
// e-mail addresses and **bold**; an array is a bullet list.
import { LEGAL_OWNER } from './legalOwner';

/** Date of the version in force of every document; a change to any of them moves it and LEGAL_VERSION. */
export const LEGAL_UPDATED = '3 de noviembre de 2026';

export type LegalDocId = 'privacidad' | 'terminos' | 'cookies';

export interface LegalSection {
    title: string;
    body: (string | string[])[];
}

export interface LegalDoc {
    title: string;
    intro: string;
    sections: LegalSection[];
}

const { name, city, email, site } = LEGAL_OWNER;

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
    privacidad: {
        title: 'Aviso de privacidad',
        intro: `Este aviso explica qué datos personales trata Voxie (${site}), para qué y cómo puedes ejercer tus derechos, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.`,
        sections: [
            {
                title: 'Responsable',
                body: [
                    `**${name}**, persona física, con domicilio en ${city}, es el responsable del tratamiento de tus datos personales en Voxie.`,
                    `Para cualquier asunto de privacidad escribe a ${email}. El responsable atiende personalmente las solicitudes.`,
                ],
            },
            {
                title: 'Datos que tratamos',
                body: [
                    [
                        '**Cuenta:** tu correo electrónico, el nombre que eliges en Ajustes y tus preferencias (como la planta de tu jardín o el orden de la barra lateral). Si entras con Google, también el nombre y la foto de perfil que Google comparte. Tu contraseña la guarda nuestro proveedor de autenticación en forma cifrada; nadie en Voxie puede verla.',
                        '**Aprendizaje:** nivel, progreso por unidad, palabras y tarjetas de repaso, historias leídas, resultados de pruebas y exámenes, racha, meta diaria y zona horaria.',
                        '**Lo que escribes y dices en los ejercicios:** tus textos de escritura, la transcripción de lo que dices en los ejercicios de habla, tus conversaciones con el tutor y las calificaciones y correcciones que genera la IA.',
                        '**Suscripción:** el identificador y el estado de tu suscripción en Mercado Pago. Voxie nunca recibe ni guarda los datos de tu tarjeta.',
                        '**Datos técnicos:** dirección IP, navegador y registros de acceso que generan nuestros proveedores de alojamiento, y el conteo diario de uso de las funciones de IA.',
                    ],
                    '**Voxie no pide datos personales sensibles** y no guarda grabaciones de tu voz. Te pedimos no escribir datos personales ni sensibles (salud, creencias, datos de otras personas, etc.) en los ejercicios ni en el tutor.',
                ],
            },
            {
                title: 'Para qué los usamos',
                body: [
                    'Finalidades necesarias para darte el servicio:',
                    [
                        'Crear y administrar tu cuenta y tu inicio de sesión.',
                        'Guardar tu progreso y sincronizarlo entre tus dispositivos.',
                        'Calificar tus ejercicios y generar respuestas con IA: tutor, escritura, habla e historias.',
                        'Gestionar tu suscripción Pro y los límites de uso de cada plan.',
                        'Proteger el servicio contra abusos, resolver fallas y atender tus solicitudes de soporte.',
                    ],
                    '**No hay finalidades secundarias:** no usamos tus datos para publicidad ni para hacer perfiles comerciales, y no los vendemos. Si algún día se agrega una (por ejemplo, anuncios), actualizaremos este aviso y te pediremos tu consentimiento cuando la ley lo exija.',
                ],
            },
            {
                title: 'Con quién se comparten',
                body: [
                    'Para funcionar, Voxie usa proveedores que tratan datos por cuenta nuestra. Sus servidores están fuera de México, principalmente en Estados Unidos:',
                    [
                        '**Supabase:** base de datos e inicio de sesión, en servidores de Estados Unidos.',
                        '**Cloudflare:** alojamiento de la app y de su servidor, en su red mundial (cada visita la atiende el centro de datos más cercano).',
                        '**Google (Gemini API):** recibe el texto de tus ejercicios, tus mensajes al tutor y las transcripciones de habla para generar la respuesta. No recibe tu correo ni tu nombre.',
                        '**Google Fonts:** tu navegador descarga las tipografías de servidores de Google, que reciben tu dirección IP.',
                        '**Reconocimiento de voz de tu navegador:** en los ejercicios de habla, la app usa el dictado de tu navegador. Según el navegador, el audio lo procesa su proveedor (por ejemplo Google en Chrome o Apple en Safari). Voxie solo recibe el texto.',
                    ],
                    '**Sobre Gemini:** Voxie usa la cuota gratuita de la API de Gemini. En ella, Google usa lo que se le envía y sus respuestas para mejorar sus productos, y personas revisoras pueden leerlo, desvinculado de la cuenta de Voxie. Por eso esta transferencia requiere tu consentimiento, que das al aceptar este aviso al crear tu cuenta (o la primera vez que entras después de su publicación). Puedes negarte o revocarlo sin dejar de usar Voxie: no uses las funciones de IA (el contenido fijo funciona sin ellas), o elimina tu cuenta.',
                    'También se comparten datos, sin necesidad de tu consentimiento, cuando la ley lo permite:',
                    [
                        '**Mercado Pago**, para cobrar la suscripción Pro que contratas: le enviamos tu correo y un identificador interno de tu cuenta. El pago se rige además por el aviso de privacidad de Mercado Pago.',
                        '**Autoridades competentes**, cuando una ley o una orden lo exija.',
                    ],
                ],
            },
            {
                title: 'Cuánto tiempo los guardamos',
                body: [
                    'Mientras tengas tu cuenta. Al eliminarla se borran de inmediato tu cuenta, tu progreso, tus textos, tus conversaciones y tus contadores de uso.',
                    'Los registros técnicos de los proveedores se borran en sus ciclos normales, y Mercado Pago conserva los registros de pago que la ley le exige. Algunas respuestas generadas por la IA (historias y ejercicios) se guardan en caché para reutilizarlas, sin ningún dato que te identifique.',
                ],
            },
            {
                title: 'Cómo los protegemos',
                body: [
                    [
                        'Toda la comunicación viaja cifrada (HTTPS).',
                        'La base de datos solo deja que cada cuenta lea y modifique sus propios datos. El responsable, como administrador, puede consultar las cuentas para dar soporte y gestionar suscripciones.',
                        'Las claves de los servicios viven en el servidor, nunca en tu navegador.',
                        'Las contraseñas se guardan cifradas con un algoritmo de un solo sentido.',
                    ],
                ],
            },
            {
                title: 'Tus derechos ARCO',
                body: [
                    'Tienes derecho a **acceder** a tus datos, **rectificarlos**, **cancelarlos** y **oponerte** a su tratamiento. Para ejercerlos, escribe a ' + email + ' desde el correo de tu cuenta e indica:',
                    [
                        'Tu nombre y un medio para recibir la respuesta.',
                        'El derecho que quieres ejercer y los datos a los que se refiere.',
                        'Si actúa un representante, el documento que lo acredite.',
                    ],
                    'Para confirmar tu identidad te pediremos comprobar el acceso al correo de tu cuenta. Te responderemos en un máximo de 20 días y, si procede, lo haremos efectivo dentro de los 15 días siguientes; la ley permite ampliar cada plazo una vez cuando el caso lo justifique. El trámite es gratuito.',
                    'Sin escribirnos, también puedes: ver tu progreso en la app, borrar tus conversaciones con el tutor desde el historial, y **eliminar tu cuenta** en Ajustes → Eliminar cuenta.',
                ],
            },
            {
                title: 'Revocar tu consentimiento y limitar el uso',
                body: [
                    `Puedes revocar tu consentimiento o pedir que limitemos el uso de tus datos escribiendo a ${email}. Revocarlo para los tratamientos necesarios implica que ya no podamos darte el servicio, y en ese caso eliminaremos tu cuenta.`,
                    'Lo que Voxie guarda en tu navegador se explica en la [Política de cookies y almacenamiento](/cookies).',
                ],
            },
            {
                title: 'Mayores de edad',
                body: [
                    'Voxie es solo para personas de 18 años o más. No tratamos a sabiendas datos de menores; si detectamos una cuenta de un menor, la eliminamos.',
                ],
            },
            {
                title: 'Cambios a este aviso',
                body: [
                    'Publicaremos cualquier cambio en esta página, con la fecha de la versión vigente. Si el cambio es importante, también te avisaremos dentro de la app o por correo antes de que aplique.',
                    'Si consideras que se vulneró tu derecho a la protección de datos, puedes acudir a la autoridad competente, que hoy es la Secretaría Anticorrupción y Buen Gobierno.',
                ],
            },
        ],
    },

    terminos: {
        title: 'Términos y condiciones',
        intro: `Estos términos regulan el uso de Voxie (${site}). Al crear una cuenta o usar la app aceptas estos términos y el [Aviso de privacidad](/privacidad).`,
        sections: [
            {
                title: 'Quién presta el servicio',
                body: [
                    `Voxie es una app para aprender inglés que ofrece **${name}**, persona física, con domicilio en ${city}. Contacto y soporte: ${email}.`,
                ],
            },
            {
                title: 'Quién puede usar Voxie',
                body: [
                    [
                        'Debes tener **18 años o más**.',
                        'Voxie no está disponible para personas que se encuentren en el Espacio Económico Europeo, Suiza o el Reino Unido; las funciones de IA no responden desde esas regiones.',
                        'Debes dar datos verdaderos al registrarte y cuidar el acceso a tu cuenta. Cada cuenta es personal.',
                    ],
                    'La prueba sin cuenta guarda tu avance solo en tu navegador hasta que te registras.',
                ],
            },
            {
                title: 'Planes',
                body: [
                    '**Gratis:** el contenido fijo de la app (unidades, historias, repasos, la prueba de nivel y los exámenes de fin de nivel) y un uso limitado de las funciones de IA. Los límites se muestran en la app y pueden cambiar.',
                    '**Pro:** suscripción mensual o anual que amplía el uso de la IA y agrega funciones, como los simulacros de examen, según lo que describa la página de [Precios](/pricing) al momento de contratar.',
                    'El uso «ilimitado» de Pro está sujeto a un uso razonable: para proteger el servicio podemos frenar temporalmente un volumen de peticiones que no corresponda a una persona estudiando.',
                ],
            },
            {
                title: 'Precio, cobro y renovación de Pro',
                body: [
                    [
                        'El precio está en pesos mexicanos y el que ves en la página de Precios antes de pagar es el total que se cobra.',
                        'El cobro lo procesa Mercado Pago con el método de pago que elijas. Voxie no conoce los datos de tu tarjeta.',
                        'La suscripción **se renueva automáticamente** al final de cada periodo (mes o año) y se cobra de nuevo, hasta que la canceles.',
                        'Si el precio cambia, te avisaremos antes de tu siguiente renovación y el precio nuevo solo aplicará a partir de ella. Puedes cancelar antes si no estás de acuerdo.',
                    ],
                ],
            },
            {
                title: 'Cancelación y reembolsos',
                body: [
                    'Puedes cancelar en cualquier momento, sin penalización, en Ajustes → Cancelar suscripción. Conservas Pro hasta el final del periodo ya pagado y no se te vuelve a cobrar.',
                    `Los periodos ya pagados no se reembolsan en proporción al cancelar. Sí te devolvemos el dinero de un cobro duplicado o no autorizado, o de un periodo en el que una falla atribuible a Voxie te impidió usar Pro. Para pedirlo, escribe a ${email} dentro de los 30 días siguientes al cobro.`,
                    'Esto no limita los derechos que te da la Ley Federal de Protección al Consumidor ni tu derecho a acudir a la Procuraduría Federal del Consumidor (Profeco).',
                ],
            },
            {
                title: 'Sobre la inteligencia artificial',
                body: [
                    [
                        'Las respuestas, correcciones y calificaciones de la IA pueden contener errores. Úsalas como guía de estudio.',
                        'Los niveles y puntajes de Voxie son una estimación orientativa del Marco Común Europeo de Referencia (MCER): **no son una certificación oficial**.',
                        'TOEFL, IELTS y Cambridge son marcas de sus respectivos dueños. Voxie no está afiliado a ellos ni avalado por ellos; los simuladores solo imitan el formato de sus exámenes.',
                        'Lo que escribes en los ejercicios y en el tutor lo procesa Google (ver el [Aviso de privacidad](/privacidad)). No escribas datos personales ni sensibles.',
                    ],
                ],
            },
            {
                title: 'Uso aceptable',
                body: [
                    'No está permitido:',
                    [
                        'Usar Voxie para fines ilegales o para generar contenido ilícito, violento, sexual o que acose a otras personas.',
                        'Automatizar el uso de la app, extraer su contenido de forma masiva o eludir los límites de uso (por ejemplo, con varias cuentas).',
                        'Intentar acceder a cuentas o datos ajenos, interferir con el servicio o hacer ingeniería inversa.',
                        'Copiar, revender o redistribuir el contenido de Voxie.',
                    ],
                ],
            },
            {
                title: 'Propiedad intelectual',
                body: [
                    `Las historias, ejercicios, audios, diseño, marca y código de Voxie son de ${name}, con todos los derechos reservados, salvo los datos de terceros que se indican en [Créditos](/credits).`,
                    'Lo que tú escribes sigue siendo tuyo. Nos das permiso de procesarlo solo para darte el servicio, como se explica en el Aviso de privacidad.',
                ],
            },
            {
                title: 'Disponibilidad del servicio',
                body: [
                    'Hacemos lo posible para que Voxie funcione siempre, pero puede haber interrupciones, cambios o mejoras en el contenido y las funciones. Si dejáramos de ofrecer Pro, te avisaremos con anticipación y te devolveremos la parte proporcional del periodo pagado que no puedas usar.',
                ],
            },
            {
                title: 'Suspensión y baja',
                body: [
                    'Puedes eliminar tu cuenta cuando quieras en Ajustes → Eliminar cuenta; si tienes Pro activo, la suscripción se cancela en ese momento.',
                    'Podemos suspender o eliminar una cuenta que incumpla estos términos. Salvo en casos graves o de abuso, te avisaremos antes por correo.',
                ],
            },
            {
                title: 'Responsabilidad',
                body: [
                    'Voxie es una herramienta de estudio y no garantiza un resultado concreto de aprendizaje ni de un examen. En la medida en que la ley lo permite, no respondemos por daños indirectos derivados del uso de la app. Nada en estos términos limita los derechos que la ley te reconoce como consumidor.',
                ],
            },
            {
                title: 'Cambios a estos términos',
                body: [
                    'Publicaremos cualquier cambio en esta página con su fecha. Si el cambio es importante, te avisaremos dentro de la app o por correo antes de que aplique. Si no estás de acuerdo, puedes cancelar tu suscripción o eliminar tu cuenta.',
                ],
            },
            {
                title: 'Ley aplicable',
                body: [
                    'Estos términos se rigen por las leyes federales de México. Para cualquier controversia, las partes se someten a los tribunales competentes de Irapuato, Guanajuato, sin perjuicio de tu derecho a acudir a la Profeco.',
                ],
            },
        ],
    },

    cookies: {
        title: 'Política de cookies y almacenamiento',
        intro: 'Voxie no usa cookies de publicidad ni de analítica, ni rastreadores de terceros. Solo guarda en tu navegador lo necesario para funcionar.',
        sections: [
            {
                title: 'Qué guarda Voxie en tu navegador',
                body: [
                    [
                        '**Sesión:** el token de inicio de sesión, para que no tengas que entrar cada vez (almacenamiento local).',
                        '**Preferencias:** tema claro u oscuro, idioma y posición de la barra lateral.',
                        '**Uso sin conexión:** una copia de tus datos y los cambios pendientes de sincronizar (IndexedDB), y los archivos de la app y los audios (caché del service worker).',
                        '**Prueba sin cuenta:** la historia y la prueba de nivel que hiciste antes de registrarte.',
                        '**Avisos ya vistos:** por ejemplo, la invitación a instalar la app o la celebración de la meta diaria, para no repetirlos.',
                    ],
                    'Todo esto es necesario para que la app funcione o recuerde lo que elegiste, por eso no pedimos permiso con un aviso emergente. Si algún día agregamos cookies que no sean necesarias, como las de anuncios, te pediremos tu permiso antes.',
                ],
            },
            {
                title: 'Servicios de terceros',
                body: [
                    [
                        '**Google Fonts:** al cargar las tipografías, Google recibe tu dirección IP.',
                        '**Google** (si entras con tu cuenta de Google) y **Mercado Pago** (al pagar Pro): en sus páginas aplican sus propias cookies y políticas.',
                    ],
                ],
            },
            {
                title: 'Cómo borrarlo',
                body: [
                    'Al cerrar sesión se borra tu sesión de ese navegador. Para borrar todo lo demás, elimina los datos del sitio desde la configuración de tu navegador. Si lo haces sin conexión, perderás los cambios que aún no se sincronizaron.',
                    'Más detalles sobre tus datos en el [Aviso de privacidad](/privacidad).',
                ],
            },
        ],
    },
};
