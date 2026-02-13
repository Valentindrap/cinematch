import { X, Shield } from 'lucide-react'
import './PrivacyPolicyModal.css'

export function PrivacyPolicyModal({ onClose }) {
    return (
        <div className="privacy-modal-overlay" onClick={onClose}>
            <div className="privacy-modal" onClick={e => e.stopPropagation()}>
                <div className="privacy-header">
                    <div className="privacy-title">
                        <Shield size={28} />
                        <h2>Política de Privacidad</h2>
                    </div>
                    <button className="privacy-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="privacy-content">
                    <section>
                        <h3>1. Introducción</h3>
                        <p>
                            Bienvenido a Watchlist Standoff. Respetamos su privacidad y nos comprometemos a proteger sus datos personales.
                            Esta política de privacidad explica cómo manejamos su información cuando utiliza nuestra aplicación.
                        </p>
                    </section>

                    <section>
                        <h3>2. Datos que recopilamos</h3>
                        <p>
                            Watchlist Standoff no requiere registro de usuario ni almacena información personal identificable en servidores propios.
                            La aplicación funciona principalmente en el lado del cliente (su navegador).
                        </p>
                        <ul>
                            <li><strong>Datos de Búsqueda:</strong> Los nombres de usuario de Letterboxd que ingresa se procesan para obtener información pública de listas de películas.</li>
                            <li><strong>Almacenamiento Local:</strong> Utilizamos "LocalStorage" de su navegador para guardar sus preferencias (tema, sonido), historial de búsquedas recientes y progreso de logros.</li>
                        </ul>
                    </section>

                    <section>
                        <h3>3. Servicios de Terceros</h3>
                        <p>
                            Utilizamos servicios de terceros que pueden recopilar información utilizada para identificarlo:
                        </p>
                        <ul>
                            <li><strong>TMDB (The Movie Database):</strong> Utilizamos la API de TMDB para obtener metadatos de películas e imágenes.</li>
                            <li><strong>Google AdSense:</strong> Utilizamos Google AdSense para mostrar anuncios. Google utiliza cookies para mostrar anuncios basados en sus visitas anteriores a este u otros sitios web.</li>
                        </ul>
                    </section>

                    <section>
                        <h3>4. Publicidad y Cookies</h3>
                        <p>
                            Los proveedores de terceros, incluido Google, utilizan cookies para mostrar anuncios basados en las visitas anteriores de un usuario a su sitio web o a otros sitios web.
                        </p>
                        <p>
                            El uso de cookies publicitarias por parte de Google permite a Google y a sus socios mostrar anuncios a sus usuarios basados en su visita a sus sitios y/o a otros sitios de Internet.
                        </p>
                        <p>
                            Los usuarios pueden inhabilitar la publicidad personalizada visitando la <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Configuración de anuncios</a>.
                        </p>
                    </section>

                    <section>
                        <h3>5. Contacto</h3>
                        <p>
                            Si tiene preguntas sobre esta política de privacidad, puede contactarnos a través del repositorio del proyecto.
                        </p>
                    </section>

                    <div className="privacy-footer">
                        <p>Última actualización: Febrero 2026</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
