import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import './SEOContent.css'

export function SEOContent() {
    const [expandedFAQ, setExpandedFAQ] = useState(null)

    const faqs = [
        {
            question: '¿Es seguro usar Watchlist Standoff con mi cuenta de Letterboxd?',
            answer: 'Absolutamente. Watchlist Standoff no requiere que inicies sesión ni que proporciones tu contraseña. La aplicación solo accede a información pública de Letterboxd que cualquier persona puede ver visitando tu perfil. No almacenamos tus datos personales, no modificamos tu watchlist y no tenemos acceso a ninguna información privada de tu cuenta.'
        },
        {
            question: '¿Cómo funciona la integración con la API de Letterboxd?',
            answer: 'Utilizamos métodos seguros y autorizados para acceder a las watchlists públicas de Letterboxd. Nuestra aplicación respeta completamente los términos de servicio de Letterboxd y solo accede a información que los usuarios han elegido hacer pública. El proceso es completamente transparente y no invasivo.'
        },
        {
            question: '¿Qué pasa si no tengo películas en común con la otra persona?',
            answer: 'Si después de comparar las watchlists no se encuentran coincidencias, la aplicación te lo notificará claramente. En este caso, puedes intentar con otro usuario o considerar agregar más películas a tu watchlist de Letterboxd antes de volver a intentarlo. También es una excelente oportunidad para descubrir los gustos cinematográficos del otro y expandir tus horizontes.'
        },
        {
            question: '¿Puedo usar la ruleta con más de dos personas?',
            answer: 'Actualmente, Watchlist Standoff está optimizado para comparar dos watchlists a la vez. Sin embargo, puedes realizar múltiples comparaciones: primero compara dos usuarios, luego compara el resultado con un tercero. Estamos considerando agregar soporte para múltiples usuarios en futuras actualizaciones.'
        },
        {
            question: '¿La aplicación funciona en dispositivos móviles?',
            answer: 'Sí, Watchlist Standoff está completamente optimizado para funcionar en smartphones, tablets y computadoras de escritorio. La experiencia es fluida en todos los dispositivos, permitiéndote decidir qué película ver desde cualquier lugar.'
        },
        {
            question: '¿Necesito crear una cuenta para usar Watchlist Standoff?',
            answer: 'No, no necesitas crear ninguna cuenta. Simplemente visita la aplicación web, ingresa los nombres de usuario de Letterboxd que quieres comparar, y comienza a usar la ruleta inmediatamente. Es rápido, sencillo y sin complicaciones.'
        }
    ]

    return (
        <div className="seo-content">
            <section className="seo-section intro">
                <h1>Letterboxd Watchlist: Descubre Qué Película Ver con la Ruleta Definitiva</h1>

                <div className="intro-text">
                    <h2>¿Cansado de no saber qué película ver? La solución está aquí</h2>

                    <p>
                        Todos hemos estado ahí: es viernes por la noche, tienes palomitas listas, estás cómodo en el sofá con tu pareja o amigos, y entonces comienza el eterno debate: "¿Qué película vemos?". Navegas por tu watchlist de Letterboxd durante 30 minutos, cada uno sugiere títulos diferentes, nadie se pone de acuerdo, y al final terminas viendo el mismo episodio de una serie que ya has visto tres veces. Este problema universal de los cinéfilos modernos tiene ahora una solución innovadora y divertida.
                    </p>

                    <p>
                        <strong>Watchlist Standoff</strong> es la herramienta definitiva para usuarios de Letterboxd que transforma la indecisión en una experiencia emocionante. Nuestra aplicación web compara dos watchlists de Letterboxd, encuentra las películas que ambos tienen en común, y utiliza una ruleta aleatoria estilo duelo del viejo oeste para decidir qué película ver. Olvídate de las discusiones interminables y convierte la selección de películas en un momento divertido que todos disfrutarán.
                    </p>
                </div>
            </section>

            <section className="seo-section how-it-works">
                <h2>Cómo Funciona Watchlist Standoff: Paso a Paso</h2>

                <p>Usar nuestra herramienta es tan sencillo como emocionante. El proceso está diseñado para ser intuitivo y rápido, permitiéndote pasar menos tiempo decidiendo y más tiempo disfrutando del cine:</p>

                <div className="steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Ingresa los nombres de usuario de Letterboxd</h3>
                            <p>Simplemente introduce tu nombre de usuario de Letterboxd y el de tu amigo, pareja o familiar con quien quieres ver una película. No necesitas contraseñas ni iniciar sesión; solo los nombres públicos de usuario son suficientes.</p>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Comparación automática de watchlists</h3>
                            <p>Nuestra aplicación accede de forma segura a las watchlists públicas de ambos usuarios y realiza un análisis instantáneo para identificar todas las películas que tienen en común. Este proceso toma solo unos segundos, sin importar cuán extensas sean las listas.</p>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Visualiza las coincidencias</h3>
                            <p>Una vez completado el análisis, verás todas las películas que ambos han guardado en sus watchlists. Cada película se muestra con su póster, título, año y calificación, brindándote una vista completa de tus opciones compartidas.</p>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                            <h3>Activa la ruleta del duelo</h3>
                            <p>Aquí viene la parte más divertida: presiona el botón de la ruleta y observa cómo las películas giran en una animación temática del viejo oeste. La tensión aumenta mientras la ruleta desacelera hasta detenerse en la película ganadora.</p>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">5</div>
                        <div className="step-content">
                            <h3>¡Disfruta tu película!</h3>
                            <p>La ruleta ha hablado. Ahora tienes una decisión clara, imparcial y emocionante sobre qué película ver. Haz clic en el resultado para ver más detalles en Letterboxd o simplemente busca la película en tu plataforma de streaming favorita y disfruta.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="seo-section benefits">
                <h2>Beneficios de Usar una Ruleta de Cine para Decidir Qué Ver</h2>

                <p>La indecisión cinematográfica es un problema real que afecta a millones de amantes del cine. Aquí te explicamos por qué una ruleta aleatoria es la solución perfecta:</p>

                <div className="benefits-grid">
                    <div className="benefit-card">
                        <h3>🎯 Elimina el sesgo de decisión</h3>
                        <p>Cuando intentas decidir entre varias opciones, a menudo te inclinas por lo familiar o lo seguro. La ruleta introduce un elemento de azar que te permite descubrir películas que quizás habrías pasado por alto, expandiendo tus horizontes cinematográficos.</p>
                    </div>

                    <div className="benefit-card">
                        <h3>⏱️ Ahorra tiempo valioso</h3>
                        <p>Estudios informales sugieren que las parejas pueden pasar hasta 45 minutos decidiendo qué ver. Con Watchlist Standoff, este tiempo se reduce a menos de un minuto, dejándote más tiempo para lo que realmente importa: disfrutar del cine.</p>
                    </div>

                    <div className="benefit-card">
                        <h3>🎬 Crea una experiencia compartida</h3>
                        <p>El momento de girar la ruleta se convierte en un evento en sí mismo. Es divertido, genera anticipación y crea un recuerdo compartido antes incluso de que comience la película.</p>
                    </div>

                    <div className="benefit-card">
                        <h3>⚖️ Justicia cinematográfica</h3>
                        <p>Nadie puede quejarse de la elección cuando fue decidida por el azar. Esto elimina las dinámicas de poder en las relaciones donde una persona siempre elige las películas.</p>
                    </div>

                    <div className="benefit-card">
                        <h3>🔍 Redescubre tu watchlist</h3>
                        <p>Muchos usuarios de Letterboxd tienen cientos de películas guardadas que nunca ven. La ruleta te ayuda a redescubrir esas joyas olvidadas y finalmente tachar títulos de tu lista.</p>
                    </div>
                </div>
            </section>

            <section className="seo-section faq">
                <h2>Preguntas Frecuentes (FAQ)</h2>

                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div key={index} className={`faq-item ${expandedFAQ === index ? 'expanded' : ''}`}>
                            <button
                                className="faq-question"
                                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                            >
                                <span>{faq.question}</span>
                                {expandedFAQ === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {expandedFAQ === index && (
                                <div className="faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section className="seo-section cta">
                <p className="cta-text">
                    <strong>Watchlist Standoff</strong> es más que una simple herramienta; es la solución definitiva para cinéfilos indecisos que quieren pasar menos tiempo debatiendo y más tiempo disfrutando del séptimo arte. Ya sea que estés planeando una noche de cine con tu pareja, organizando una sesión con amigos, o simplemente quieres una forma divertida de elegir tu próxima película, nuestra ruleta cinematográfica convierte la decisión en una experiencia memorable. ¡Deja que el destino decida y prepárate para descubrir tu próxima película favorita!
                </p>
            </section>
        </div>
    )
}
