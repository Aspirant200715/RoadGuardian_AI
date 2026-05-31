import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Simple translations for demonstration
const resources = {
  en: {
    translation: {
      "language": "Language",
      "app_title": "Official Hazard Report Form",
      "app_desc": "Document infrastructure discrepancies for municipal action.",
      "step1": "Step 1: Visual Documentation",
      "select_file": "Select File or Capture Image",
      "proceed": "Proceed to AI Analysis",
      "submit": "Submit Official Report"
    }
  },
  hi: {
    translation: {
      "language": "भाषा",
      "app_title": "आधिकारिक खतरा रिपोर्ट फॉर्म",
      "app_desc": "नगरपालिका कार्रवाई के लिए बुनियादी ढांचे की विसंगतियों का दस्तावेजीकरण करें।",
      "step1": "चरण 1: दृश्य दस्तावेज़ीकरण",
      "select_file": "फ़ाइल चुनें या छवि कैप्चर करें",
      "proceed": "AI विश्लेषण के लिए आगे बढ़ें",
      "submit": "आधिकारिक रिपोर्ट जमा करें"
    }
  },
  es: {
    translation: {
      "language": "Idioma",
      "app_title": "Formulario Oficial de Reporte de Riesgos",
      "app_desc": "Documente las discrepancias de infraestructura para la acción municipal.",
      "step1": "Paso 1: Documentación Visual",
      "select_file": "Seleccionar archivo o capturar imagen",
      "proceed": "Proceder al análisis de IA",
      "submit": "Enviar Informe Oficial"
    }
  },
  de: {
    translation: {
      "language": "Sprache",
      "app_title": "Offizielles Gefahrenmeldeformular",
      "app_desc": "Dokumentieren Sie Infrastrukturdiskrepanzen für kommunale Maßnahmen.",
      "step1": "Schritt 1: Visuelle Dokumentation",
      "select_file": "Datei auswählen oder Bild aufnehmen",
      "proceed": "Zur KI-Analyse",
      "submit": "Offiziellen Bericht einreichen"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
