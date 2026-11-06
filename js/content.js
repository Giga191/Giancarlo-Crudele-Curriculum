/* =========================================================================
   CONTENUTI DEL SITO  —  bilingue IT / EN
   -------------------------------------------------------------------------
   Questo è l'UNICO file che devi modificare per aggiornare i testi del CV.
   Ogni voce ha la versione "it" (italiano) e "en" (inglese).
   Modifica liberamente: il resto del sito si aggiorna da solo.
   ========================================================================= */

const CONTENT = {

  /* ---- Dati di base / intestazione ------------------------------------ */
  profile: {
    name: "Giancarlo Crudele",
    photo: "assets/foto.jpg",            // metti qui la tua foto (opzionale)
    cvFile: "assets/cv-giancarlo-crudele.pdf",
    role: {
      it: "Programmatore / Sistemista · Laureando in Ingegneria Informatica",
      en: "Software Developer / Systems Administrator · Computer Engineering Student"
    },
    location: { it: "Triggiano (BA), Italia", en: "Triggiano (BA), Italy" },
    email: "giancarlocrudele191@gmail.com",
    phone: "+39 380 376 3395",
    linkedin: "https://linkedin.com/in/giancarlocrudele"
  },

  /* ---- Etichette di interfaccia (bottoni, titoli ricorrenti) ---------- */
  ui: {
    heroTitle:   { it: "Benvenuto nella mia città 🌆", en: "Welcome to my city 🌆" },
    enter:       { it: "Esplora la città",        en: "Explore the city" },
    hint:        { it: "Clicca su un edificio per scoprire una parte del mio percorso",
                   en: "Click a building to discover a part of my journey" },
    downloadCv:  { it: "Scarica il CV (PDF)",     en: "Download CV (PDF)" },
    welcomeTitle:{ it: "Benvenuto, viandante! 🏰", en: "Welcome, traveler! 🏰" },
    welcomeText: { it: "Questa città medievale è il mio curriculum: ogni edificio custodisce una parte del mio percorso. Esplorala liberamente ed entra dalle porte per scoprirla!",
                   en: "This medieval town is my résumé: each building holds a part of my journey. Explore it freely and step through the doors to discover it!" },
    welcomeKeys: { it: "<b>WASD</b>/frecce per muoverti · <b>E</b> per entrare · <b>SPAZIO</b> per saltare · trascina per ruotare · rotella per lo zoom",
                   en: "<b>WASD</b>/arrows to move · <b>E</b> to enter · <b>SPACE</b> to jump · drag to rotate · scroll to zoom" },
    welcomeBtn:  { it: "Inizia l'esplorazione ⚔️", en: "Start exploring ⚔️" },
    visited:     { it: "sezioni visitate",         en: "sections visited" },
    petCat:      { it: "Accarezza il gatto 🐈‍⬛",   en: "Pet the cat 🐈‍⬛" },
    backToCity:  { it: "Torna alla città",        en: "Back to the city" },
    close:       { it: "Chiudi",                  en: "Close" },
    present:     { it: "Attuale",                 en: "Present" },
    footer:      { it: "Realizzato con passione · 2026",
                   en: "Built with passion · 2026" }
  },

  /* =====================================================================
     SEZIONI  —  ogni sezione = un edificio della città
     'id' deve combaciare con quello usato in city.js
     ===================================================================== */
  sections: {

    /* 1. CHI SONO ----------------------------------------------------- */
    about: {
      icon: "🏠",
      title: { it: "Chi sono", en: "About me" },
      subtitle: { it: "Il villaggio di partenza", en: "The starting village" },
      body: {
        it: [
          "Sono Giancarlo Crudele, perito tecnico informatico e laureando in Ingegneria Informatica all'Università Mercatorum. Dopo il diploma ho frequentato l'ITS Apulia Digital Maker (corso Developer 4.0), dove ho consolidato le basi informatiche e acquisito competenze pratiche nello sviluppo software.",
          "Ho maturato esperienza in diversi ambiti dell'informatica, costruendo un profilo tecnico trasversale: sviluppo Full Stack (C#, .NET, Java, Angular, HTML, CSS, JavaScript) e gestione di database; Business Intelligence con dashboard in Microsoft Power BI e Apache Superset; amministrazione di sistemi e reti, con installazione, configurazione e manutenzione di apparati di rete, workstation e periferiche.",
          "Il lavoro sul campo mi ha insegnato troubleshooting, assistenza tecnica e supporto agli utenti, affrontando problemi hardware, software e infrastrutturali in contesti diversi.",
          "Sono curioso, dinamico e orientato al problem-solving, con una forte passione per la tecnologia. Imparo in fretta, mi adatto bene e lavoro volentieri sia in autonomia sia in team. Il mio obiettivo è crescere in realtà dinamiche, contribuendo allo sviluppo di soluzioni tecnologiche e all'innovazione dei processi aziendali."
        ],
        en: [
          "I'm Giancarlo Crudele, a certified IT technician and Computer Engineering student at Università Mercatorum. After high school I attended ITS Apulia Digital Maker (Developer 4.0 course), where I strengthened my IT foundations and gained hands-on software development skills.",
          "I've built a cross-functional technical profile across several IT areas: Full Stack development (C#, .NET, Java, Angular, HTML, CSS, JavaScript) and database management; Business Intelligence with dashboards in Microsoft Power BI and Apache Superset; systems and network administration, installing, configuring and maintaining network devices, workstations and peripherals.",
          "Working in the field taught me troubleshooting, technical assistance and user support, tackling hardware, software and infrastructure issues in different settings.",
          "I'm curious, dynamic and problem-solving oriented, with a strong passion for technology. I learn fast, adapt well and enjoy working both independently and in a team. My goal is to grow in dynamic companies, helping build technology solutions and innovate business processes."
        ]
      }
    },

    /* 2. ESPERIENZA --------------------------------------------------- */
    experience: {
      icon: "💼",
      title: { it: "Esperienza", en: "Experience" },
      subtitle: { it: "Le torri del lavoro", en: "The work towers" },
      items: [
        {
          role: { it: "Programmatore / Sistemista", en: "Software Developer / Systems Administrator" },
          org: "Tecno Quality Srl",
          place: { it: "Rutigliano, Italia", en: "Rutigliano, Italy" },
          period: { it: "Nov 2025 – Ott 2026", en: "Nov 2025 – Oct 2026" },
          desc: {
            it: [
              "Sviluppo Full Stack: applicazioni web con backend in .NET e frontend in HTML, CSS e JavaScript.",
              "Business Intelligence: dashboard interattive e strumenti di analisi dei dati con Microsoft Power BI e Apache Superset.",
              "Infrastrutture e servizi: configurazione e manutenzione di container Docker per Superset e NetBird (BI e accesso remoto).",
              "Networking: installazione, configurazione e manutenzione di dispositivi di rete Ubiquiti UniFi.",
              "Manutenzione hardware: installazione, configurazione e assistenza su stampanti industriali e dispositivi hardware.",
              "Help Desk e supporto IT: assistenza agli utenti, gestione delle problematiche e manutenzione dei software aziendali."
            ],
            en: [
              "Full Stack development: web applications with a .NET backend and an HTML, CSS and JavaScript frontend.",
              "Business Intelligence: interactive dashboards and data analysis tools with Microsoft Power BI and Apache Superset.",
              "Infrastructure and services: setup and maintenance of Docker containers for Superset and NetBird (BI and remote access).",
              "Networking: installation, configuration and maintenance of Ubiquiti UniFi network devices.",
              "Hardware maintenance: installation, configuration and support for industrial printers and hardware devices.",
              "Help Desk and IT support: user assistance, issue handling and maintenance of business software."
            ]
          }
        },
        {
          role: { it: "Sistemista / Helpdesk", en: "Systems Administrator / Helpdesk" },
          org: "Euronet Srl",
          place: { it: "Grottaglie, Italia", en: "Grottaglie, Italy" },
          period: { it: "Feb 2025 – Nov 2025", en: "Feb 2025 – Nov 2025" },
          desc: {
            it: [
              "Installazione, configurazione e manutenzione dell'infrastruttura di rete aeroportuale.",
              "Gestione e manutenzione di apparati di rete e infrastrutture LAN.",
              "Installazione e manutenzione di workstation, PC, periferiche, stampanti e dispositivi di stampa.",
              "Help desk e supporto tecnico di primo livello: diagnosi e risoluzione di problemi hardware e software.",
              "Installazione e configurazione di sistemi operativi e applicativi."
            ],
            en: [
              "Installation, configuration and maintenance of the airport network infrastructure.",
              "Management and maintenance of network devices and LAN infrastructure.",
              "Installation and maintenance of workstations, PCs, peripherals, printers and print devices.",
              "First-level help desk and technical support: diagnosing and fixing hardware and software issues.",
              "Installation and configuration of operating systems and applications."
            ]
          }
        },
        {
          role: { it: "Responsabile inventario farmacie", en: "Pharmacy Inventory Lead" },
          org: "Inventory Service European S.R.L.",
          place: { it: "Bari, Italia", en: "Bari, Italy" },
          period: { it: "Dic 2024 – Giu 2025", en: "Dec 2024 – Jun 2025" },
          desc: {
            it: ["Gestione e coordinamento delle attività di inventario presso farmacie."],
            en: ["Management and coordination of inventory activities at pharmacies."]
          }
        },
        {
          role: { it: "Commesso di negozio di abbigliamento", en: "Retail Sales Assistant" },
          org: "Primark",
          place: { it: "Casamassima, Italia", en: "Casamassima, Italy" },
          period: { it: "Nov 2024 – Giu 2025", en: "Nov 2024 – Jun 2025" },
          desc: {
            it: ["Assistenza clienti, gestione del punto vendita e del reparto."],
            en: ["Customer assistance, store and department management."]
          }
        },
        {
          role: { it: "Software Engineer (Stage)", en: "Software Engineer (Internship)" },
          org: "Exprivia S.p.A.",
          place: { it: "Molfetta, Italia", en: "Molfetta, Italy" },
          period: { it: "Dic 2023 – Mag 2024", en: "Dec 2023 – May 2024" },
          desc: {
            it: ["Sviluppo di una soluzione software per una Pubblica Amministrazione, con backend in Java e frontend in HTML e Angular."],
            en: ["Development of a software solution for a Public Administration body, with a Java backend and an HTML and Angular frontend."]
          }
        },
        {
          role: { it: "Rivenditore di abbigliamento (in proprio)", en: "Independent Clothing Reseller" },
          org: { it: "Attività in proprio", en: "Self-employed" },
          place: { it: "Triggiano, Italia", en: "Triggiano, Italy" },
          period: { it: "Apr 2019 – Lug 2024", en: "Apr 2019 – Jul 2024" },
          desc: {
            it: ["Acquisto merce, vendite, customer service, logistica e spedizioni."],
            en: ["Stock purchasing, sales, customer service, logistics and shipping."]
          }
        }
      ]
    },

    /* 3. ISTRUZIONE --------------------------------------------------- */
    education: {
      icon: "🎓",
      title: { it: "Istruzione", en: "Education" },
      subtitle: { it: "L'accademia", en: "The academy" },
      items: [
        {
          role: { it: "Laurea in Ingegneria Informatica", en: "BSc in Computer Engineering" },
          org: "Università Mercatorum",
          place: { it: "Roma, Italia · EQF 6", en: "Rome, Italy · EQF 6" },
          period: { it: "Lug 2024 – Attuale", en: "Jul 2024 – Present" },
          desc: { it: ["Percorso di laurea in corso."], en: ["Degree in progress."] }
        },
        {
          role: { it: "Diploma Tecnico Superiore — Developer 4.0", en: "Higher Technical Diploma — Developer 4.0" },
          org: "ITS Apulia Digital Maker",
          place: { it: "Bari, Italia · Voto 100 · EQF 5", en: "Bari, Italy · Grade 100 · EQF 5" },
          period: { it: "Nov 2022 – Giu 2024", en: "Nov 2022 – Jun 2024" },
          desc: {
            it: [
              "Sviluppo e analisi di software e applicazioni.",
              "C# base e avanzato, Java SE/EE, microservizi in Java.",
              "Basi di dati SQL e NoSQL, UML, UX/UI.",
              "Quality Assurance (test automation, JUnit, build & automation).",
              "Big Data & Cloud, Intelligenza Artificiale, Cybersecurity, Project Management."
            ],
            en: [
              "Software and application development & analysis.",
              "C# (basic & advanced), Java SE/EE, Java microservices.",
              "SQL & NoSQL databases, UML, UX/UI.",
              "Quality Assurance (test automation, JUnit, build & automation).",
              "Big Data & Cloud, Artificial Intelligence, Cybersecurity, Project Management."
            ]
          }
        },
        {
          role: { it: "Diploma di Perito Tecnico Informatico", en: "Technical IT High School Diploma" },
          org: 'I.T.T. "Panetti-Pitagora"',
          place: { it: "Bari, Italia · EQF 4", en: "Bari, Italy · EQF 4" },
          period: { it: "2017 – 2022", en: "2017 – 2022" },
          desc: { it: ["Tecnologie dell'informazione e della comunicazione (TIC)."],
                  en: ["Information and communication technologies (ICT)."] }
        }
      ]
    },

    /* 4. COMPETENZE --------------------------------------------------- */
    skills: {
      icon: "🛠️",
      title: { it: "Competenze tecniche", en: "Technical skills" },
      subtitle: { it: "L'officina", en: "The workshop" },
      // I livelli (0-100) sono indicativi, in stile "RPG". Modificali a piacere.
      groups: [
        {
          name: { it: "Linguaggi", en: "Languages" },
          skills: [
            { name: "Java", level: 75 },
            { name: "C# / .NET", level: 70 },
            { name: "Visual Basic / VB.NET", level: 65 },
            { name: "C++", level: 60 },
            { name: "C", level: 55 }
          ]
        },
        {
          name: { it: "Web & Frontend", en: "Web & Frontend" },
          skills: [
            { name: "HTML / CSS", level: 80 },
            { name: "JavaScript", level: 70 },
            { name: "Bootstrap", level: 70 },
            { name: "PHP", level: 55 },
            { name: "Angular", level: 45 }
          ]
        },
        {
          name: { it: "Dati & Strumenti", en: "Data & Tools" },
          skills: [
            { name: "SQL / MySQL", level: 70 },
            { name: "NoSQL", level: 55 },
            { name: "UML", level: 65 }
          ]
        },
        {
          name: { it: "Business Intelligence", en: "Business Intelligence" },
          skills: [
            { name: "Power BI", level: 65 },
            { name: "Apache Superset", level: 60 }
          ]
        },
        {
          name: { it: "Sistemi & Reti", en: "Systems & Networking" },
          skills: [
            { name: "Ubiquiti UniFi", level: 65 },
            { name: "Docker", level: 60 },
            { name: "Proxmox", level: 55 },
            { name: "VPN (NetBird)", level: 60 },
            { name: "Help desk / Troubleshooting", level: 75 }
          ]
        }
      ],
      tags: {
        it: ["Sviluppo Full Stack", "Business Intelligence", "Gestione sistemi e reti", "Virtualizzazione (Proxmox/Docker)", "Hardware e stampanti industriali", "Supporto IT", "Microservizi", "Quality Assurance / JUnit", "Big Data & Cloud", "Intelligenza Artificiale", "Cybersecurity", "Project Management", "UX/UI", "Patente B"],
        en: ["Full Stack development", "Business Intelligence", "Systems & network management", "Virtualization (Proxmox/Docker)", "Hardware & industrial printers", "IT support", "Microservices", "Quality Assurance / JUnit", "Big Data & Cloud", "Artificial Intelligence", "Cybersecurity", "Project Management", "UX/UI", "Driving licence B"]
      }
    },

    /* 5. LINGUE ------------------------------------------------------- */
    languages: {
      icon: "🌍",
      title: { it: "Lingue", en: "Languages" },
      subtitle: { it: "Il portale del mondo", en: "The world portal" },
      items: [
        { name: { it: "Italiano", en: "Italian" }, level: { it: "Madrelingua", en: "Native" }, value: 100 },
        { name: { it: "Inglese", en: "English" }, level: { it: "B2 — Intermedio superiore", en: "B2 — Upper intermediate" }, value: 70 }
      ]
    },

    /* 6. HOBBY -------------------------------------------------------- */
    hobbies: {
      icon: "🎮",
      title: { it: "Hobby e interessi", en: "Hobbies & interests" },
      subtitle: { it: "La sala relax", en: "The arcade" },
      items: [
        { icon: "🎮", label: { it: "Videogiochi", en: "Video games" } },
        { icon: "📚", label: { it: "Fumetti", en: "Comics" } },
        { icon: "⚽", label: { it: "Sport", en: "Sport" } },
        { icon: "🎬", label: { it: "Cinema", en: "Cinema" } },
        { icon: "🎵", label: { it: "Musica", en: "Music" } },
        { icon: "👕", label: { it: "Moda", en: "Fashion" } },
        { icon: "💻", label: { it: "Tecnologia", en: "Technology" } }
      ]
    },

    /* 7. CONTATTI ----------------------------------------------------- */
    contact: {
      icon: "✉️",
      title: { it: "Contatti", en: "Contact" },
      subtitle: { it: "Il faro", en: "The lighthouse" },
      text: {
        it: "Hai un'opportunità o vuoi semplicemente fare due chiacchiere? Mi farebbe piacere sentirti!",
        en: "Got an opportunity or just want to chat? I'd love to hear from you!"
      }
    }
  }
};

/* Rende CONTENT accessibile anche ai moduli ES (es. la città 3D) */
if (typeof window !== "undefined") window.CONTENT = CONTENT;
