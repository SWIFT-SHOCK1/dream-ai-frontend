const API_URL = "https://dream-ai-backend-op32.onrender.com/api/analyze";

const SUPABASE_URL = "https://wjidmjstomsxsbyzrisu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_sPpBRJe5BtVw7yQFfjRNuA_UlqJFNXy";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

let currentProject = null;
/* =========================
SUPABASE AUTH
========================= */

let currentUser = null;

function creerInterfaceAuth() {

    const header = document.querySelector("header");

    if (!header || document.getElementById("auth-btn")) {
        return;
    }

    const authButton = document.createElement("button");

    authButton.id = "auth-btn";
    authButton.textContent = "👤 Connexion";

    authButton.style.marginLeft = "10px";

    header.appendChild(authButton);

    authButton.addEventListener("click", ouvrirAuth);
}

function ouvrirAuth() {

    if (document.getElementById("auth-modal")) {
        return;
    }

    const modal = document.createElement("div");

    modal.id = "auth-modal";

    modal.innerHTML = `
        <div style="
            position:fixed;
            inset:0;
            background:rgba(0,0,0,.7);
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:9999;
            padding:20px;
        ">

            <div style="
                width:100%;
                max-width:400px;
                background:#151515;
                padding:25px;
                border-radius:20px;
            ">

                <h2 id="auth-title">
                    Connexion à DREAM AI
                </h2>

                <input
                    id="auth-email"
                    type="email"
                    placeholder="Email"
                    style="
                        width:100%;
                        padding:12px;
                        margin:8px 0;
                    "
                >

                <input
                    id="auth-password"
                    type="password"
                    placeholder="Mot de passe"
                    style="
                        width:100%;
                        padding:12px;
                        margin:8px 0;
                    "
                >

                <button
                    id="auth-submit"
                    style="
                        width:100%;
                        padding:12px;
                        margin-top:10px;
                    "
                >
                    Se connecter
                </button>

                <button
                    id="auth-switch"
                    style="
                        width:100%;
                        padding:10px;
                        margin-top:10px;
                    "
                >
                    Créer un compte
                </button>

                <button
                    id="auth-close"
                    style="
                        width:100%;
                        padding:10px;
                        margin-top:10px;
                    "
                >
                    Fermer
                </button>

                <p id="auth-message"></p>

            </div>
        </div>
    `;

    document.body.appendChild(modal);

    let inscription = false;

    const submit = document.getElementById("auth-submit");
    const switchButton = document.getElementById("auth-switch");
    const closeButton = document.getElementById("auth-close");

    switchButton.addEventListener("click", () => {

        inscription = !inscription;

        document.getElementById("auth-title").textContent =
            inscription
                ? "Créer un compte DREAM AI"
                : "Connexion à DREAM AI";

        submit.textContent =
            inscription
                ? "Créer mon compte"
                : "Se connecter";

        switchButton.textContent =
            inscription
                ? "J'ai déjà un compte"
                : "Créer un compte";

    });

    closeButton.addEventListener("click", () => {
        modal.remove();
    });

    submit.addEventListener("click", async () => {

        const email =
            document.getElementById("auth-email").value.trim();

        const password =
            document.getElementById("auth-password").value;

        const message =
            document.getElementById("auth-message");

        if (!email || !password) {
            message.textContent =
                "Remplis tous les champs.";
            return;
        }

        submit.disabled = true;

        if (inscription) {

            const { data, error } =
                await supabaseClient.auth.signUp({
                    email,
                    password
                });

            submit.disabled = false;

            if (error) {

                message.textContent =
                    error.message;

                return;
            }

            message.textContent =
                data.session
                    ? "Compte créé ✅"
                    : "Compte créé. Vérifie ton email 📧";

        } else {

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            submit.disabled = false;

            if (error) {

                message.textContent =
                    error.message;

                return;
            }

            currentUser = data.user;

            modal.remove();

            afficherUtilisateur();

            showToast(
                "Connexion réussie 👋"
            );
        }

    });

}

function afficherUtilisateur() {

    const authButton =
        document.getElementById("auth-btn");

    if (!authButton) {
        return;
    }

    if (currentUser) {

        authButton.textContent =
            "👤 " +
            (
                currentUser.email ||
                "Mon compte"
            );

        authButton.onclick =
            afficherMenuUtilisateur;

    } else {

        authButton.textContent =
            "👤 Connexion";

        authButton.onclick =
            ouvrirAuth;

    }

}

function afficherMenuUtilisateur() {

    const choix =
        confirm(
            "Connecté avec : " +
            currentUser.email +
            "\n\nOK = Déconnexion"
        );

    if (choix) {
        deconnecterUtilisateur();
    }

}

async function deconnecterUtilisateur() {

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {

        showToast(
            "Erreur de déconnexion."
        );

        return;
    }

    currentUser = null;

    afficherUtilisateur();

    showToast(
        "Déconnexion réussie 👋"
    );

}

async function initialiserAuth() {

    const {
        data
    } =
        await supabaseClient.auth.getSession();

    currentUser =
        data.session
            ? data.session.user
            : null;

    afficherUtilisateur();

    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            currentUser =
                session
                    ? session.user
                    : null;

            afficherUtilisateur();

        }
    );

}

creerInterfaceAuth();

initialiserAuth();
/* =========================
ÉLÉMENTS HTML
========================= */

const form = document.getElementById("prompt-form");
const textarea = document.getElementById("idea-input");
const charCount = document.getElementById("char-count");

const hero = document.querySelector(".hero");
const loading = document.getElementById("loading-state");
const loaderText = document.getElementById("loader-text");
const result = document.getElementById("result");

const resultName = document.getElementById("result-name");
const resultSummary = document.getElementById("result-summary");
const resultConcept = document.getElementById("result-concept");
const resultFeatures = document.getElementById("result-features");
const resultSteps = document.getElementById("result-steps");
const resultIdeas = document.getElementById("result-ideas");
const resultMoney = document.getElementById("result-money");

const scoreValue = document.getElementById("score-value");
const scoreDescription = document.getElementById("score-description");

const originalityValue = document.getElementById("originality-value");
const originalityBar = document.getElementById("originality-bar");

const potentialValue = document.getElementById("potential-value");
const potentialBar = document.getElementById("potential-bar");

const feasibilityValue = document.getElementById("feasibility-value");
const feasibilityBar = document.getElementById("feasibility-bar");

const interfacePreview = document.getElementById("interface-preview");

const historySection = document.getElementById("history-section");
const historyList = document.getElementById("history-list");

const toast = document.getElementById("toast");

const saveButton = document.getElementById("save-btn");
const improveButton = document.getElementById("improve-btn");
const exportButton = document.getElementById("export-btn");
const resetButton = document.getElementById("reset-btn");

const themeButton = document.getElementById("theme-btn");
const historyButton = document.getElementById("history-btn");
const closeHistory = document.getElementById("close-history");
const languageButton = document.getElementById("language-btn");
const premiumButton = document.getElementById("premium-btn");

/* =========================
AFFICHAGE
========================= */

function afficherChargement(visible) {

if (loading) {
    loading.hidden = !visible;
}

if (result && visible) {
    result.hidden = true;
}

if (hero) {
    hero.style.opacity = visible ? "0.7" : "1";
}

}

function afficherResultat(visible) {

if (!result) {
    return;
}

result.hidden = !visible;

if (visible) {
    result.style.display = "";
}

if (!visible) {
    result.style.display = "";
}

}

/* =========================
TOAST
========================= */

function showToast(message) {

if (!toast) {
    console.log(message);
    return;
}

toast.textContent = message;
toast.classList.add("show");

setTimeout(() => {
    toast.classList.remove("show");
}, 3000);

}

/* =========================
PROTECTION HTML
========================= */

function escapeHTML(text) {

if (text === null || text === undefined) {
    return "";
}

return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

/* =========================
TRANSFORMER EN LISTE
========================= */

function transformerEnListe(text) {

if (!text) {
    return [];
}

return String(text)
    .split("\n")
    .map(line => {

        return line
            .replace(/^[-•*]\s*/, "")
            .replace(/^\d+[.)]\s*/, "")
            .trim();

    })
    .filter(line => line.length > 0);

}

/* =========================
COMPTEUR
========================= */

if (textarea) {

textarea.addEventListener("input", () => {

    if (charCount) {
        charCount.textContent =
            textarea.value.length;
    }

});

}

/* =========================
EXEMPLES
========================= */

document
.querySelectorAll(".example-button")
.forEach(button => {

    button.addEventListener("click", () => {

        const idea =
            button.dataset.idea || "";

        if (textarea) {

            textarea.value = idea;

            textarea.dispatchEvent(
                new Event("input")
            );

            textarea.focus();
        }

    });

});

/* =========================
ANALYSER
========================= */

if (form) {

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const idea =
        textarea
            ? textarea.value.trim()
            : "";

    if (!idea) {

        showToast(
            "Écris une idée avant de lancer l'analyse."
        );

        return;
    }

    console.log("🚀 DREAM AI");
    console.log("💡 Idée :", idea);

    afficherChargement(true);

    if (loaderText) {
        loaderText.textContent =
            "DREAM AI analyse ton idée...";
    }

    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    idea: idea
                })

            });


        console.log(
            "📡 Statut serveur :",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "Erreur serveur : " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "🤖 Réponse :",
            data
        );


        if (!data.ok) {

            throw new Error(
                data.error ||
                "Erreur DREAM AI."
            );

        }


        if (!data.result) {

            throw new Error(
                "Aucun résultat reçu."
            );

        }


        if (loaderText) {

            loaderText.textContent =
                "Analyse terminée !";

        }


        afficherResultatIA(
            data.result,
            idea
        );


        showToast(
            "Analyse terminée ✅"
        );


    } catch (error) {

        console.error(
            "❌ ERREUR DREAM AI :",
            error
        );


        afficherChargement(false);


        showToast(
            error.message ||
            "Impossible de contacter DREAM AI."
        );

    }

});

}

/* =========================
AFFICHER RÉSULTAT IA
========================= */

function afficherResultatIA(text, idea) {

console.log(
    "🎯 Affichage du résultat..."
);


if (!text) {

    showToast(
        "Aucun résultat à afficher."
    );

    return;
}


const nom =
    extraireSection(
        text,
        "NOM DU PROJET",
        "RÉSUMÉ"
    );


const resume =
    extraireSection(
        text,
        "RÉSUMÉ",
        "CONCEPT"
    );


const concept =
    extraireSection(
        text,
        "CONCEPT",
        "FONCTIONNALITÉS"
    );


const fonctionnalites =
    extraireSection(
        text,
        "FONCTIONNALITÉS",
        "ÉTAPES"
    );


const etapes =
    extraireSection(
        text,
        "ÉTAPES",
        "AMÉLIORATIONS"
    );


const ameliorations =
    extraireSection(
        text,
        "AMÉLIORATIONS",
        "MONÉTISATION"
    );


const monetisation =
    extraireSection(
        text,
        "MONÉTISATION",
        "NOTE"
    );


const noteText =
    extraireSection(
        text,
        "NOTE",
        null
    );


const score =
    extraireNoteIA(noteText);


currentProject = {

    id: Date.now(),

    idea: idea,

    name:
        nom ||
        "Projet DREAM AI",

    summary:
        resume ||
        "DREAM AI a analysé ton idée.",

    concept:
        concept ||
        "Concept généré par DREAM AI.",

    features:
        fonctionnalites,

    steps:
        etapes,

    improvements:
        ameliorations,

    money:
        monetisation,

    score:
        score,

    raw:
        text,

    date:
        new Date().toLocaleString(
            "fr-FR"
        )

};


/* NOM */

if (resultName) {

    resultName.textContent =
        currentProject.name;

}


/* RÉSUMÉ */

if (resultSummary) {

    resultSummary.textContent =
        currentProject.summary;

}


/* CONCEPT */

if (resultConcept) {

    resultConcept.textContent =
        currentProject.concept;

}


/* LISTES */

afficherListe(
    resultFeatures,
    currentProject.features
);


afficherListe(
    resultSteps,
    currentProject.steps
);


afficherListe(
    resultIdeas,
    currentProject.improvements
);


/* MONÉTISATION */

if (resultMoney) {

    resultMoney.textContent =
        currentProject.money ||
        "Aucune information disponible.";

}


/* SCORE */

afficherScore(
    currentProject.score
);


/* INTERFACE */

genererInterfacePreview(
    currentProject.name
);


/* AFFICHAGE */

afficherChargement(false);

afficherResultat(true);


/* HISTORIQUE */

sauvegarderDansHistorique(
    currentProject
);


console.log(
    "✅ Résultat affiché avec succès."
);


setTimeout(() => {

    if (result) {

        result.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}, 100);

}

/* =========================
EXTRAIRE SECTION
========================= */

function extraireSection(
text,
debut,
fin
) {

if (!text) {
    return "";
}


const escapedStart =
    debut.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );


let pattern;


if (fin) {

    const escapedEnd =
        fin.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    pattern =
        new RegExp(
            escapedStart +
            "\\s*:\\s*([\\s\\S]*?)(?=" +
            escapedEnd +
            "\\s*:)",
            "i"
        );


} else {

    pattern =
        new RegExp(
            escapedStart +
            "\\s*:\\s*([\\s\\S]*)",
            "i"
        );

}


const match =
    text.match(pattern);


if (!match) {
    return "";
}


return match[1].trim();

}

/* =========================
NOTE
========================= */

function extraireNoteIA(text) {

if (!text) {
    return 75;
}


const match =
    text.match(
        /(\d{1,3})\s*\/\s*100/
    );


if (match) {

    let score =
        parseInt(
            match[1],
            10
        );


    return Math.max(
        0,
        Math.min(100, score)
    );

}


const number =
    text.match(
        /\b(\d{1,3})\b/
    );


if (number) {

    const score =
        parseInt(
            number[1],
            10
        );


    if (
        score >= 0 &&
        score <= 100
    ) {

        return score;

    }

}


return 75;

}

/* =========================
AFFICHER LISTE
========================= */

function afficherListe(
element,
text
) {

if (!element) {
    return;
}


const liste =
    transformerEnListe(text);


if (liste.length === 0) {

    element.innerHTML =
        "<li>Aucune information disponible.</li>";

    return;
}


element.innerHTML =
    liste
        .map(item =>
            `<li>${escapeHTML(item)}</li>`
        )
        .join("");

}

/* =========================
SCORE
========================= */

function afficherScore(score) {

score =
    Math.max(
        0,
        Math.min(
            100,
            Number(score) || 0
        )
    );


if (scoreValue) {

    scoreValue.textContent =
        score;

}


if (scoreDescription) {

    if (score >= 90) {

        scoreDescription.textContent =
            "Excellente idée avec un très fort potentiel.";

    } else if (score >= 75) {

        scoreDescription.textContent =
            "Très bonne idée avec un potentiel intéressant.";

    } else if (score >= 60) {

        scoreDescription.textContent =
            "Bonne base qui peut encore être améliorée.";

    } else {

        scoreDescription.textContent =
            "L'idée nécessite quelques améliorations.";

    }

}


const originality =
    Math.max(
        20,
        Math.min(
            100,
            score +
            Math.floor(
                Math.random() * 15
            ) - 7
        )
    );


const potential =
    Math.max(
        20,
        Math.min(
            100,
            score +
            Math.floor(
                Math.random() * 15
            ) - 7
        )
    );


const feasibility =
    Math.max(
        20,
        Math.min(
            100,
            score +
            Math.floor(
                Math.random() * 15
            ) - 7
        )
    );


if (originalityValue) {
    originalityValue.textContent =
        originality + "%";
}


if (originalityBar) {
    originalityBar.style.width =
        originality + "%";
}


if (potentialValue) {
    potentialValue.textContent =
        potential + "%";
}


if (potentialBar) {
    potentialBar.style.width =
        potential + "%";
}


if (feasibilityValue) {
    feasibilityValue.textContent =
        feasibility + "%";
}


if (feasibilityBar) {
    feasibilityBar.style.width =
        feasibility + "%";
}

}

/* =========================
APERÇU INTERFACE
========================= */

function genererInterfacePreview(name) {

if (!interfacePreview) {
    return;
}


interfacePreview.innerHTML = `

    <div style="
        padding:24px;
        border-radius:20px;
        background:rgba(255,255,255,0.05);
    ">

        <div style="
            font-size:24px;
            font-weight:700;
            margin-bottom:15px;
        ">
            ${escapeHTML(name)}
        </div>

        <div style="
            display:grid;
            gap:12px;
        ">

            <div style="
                padding:15px;
                border-radius:12px;
                background:rgba(255,255,255,0.07);
            ">
                Tableau de bord
            </div>

            <div style="
                padding:15px;
                border-radius:12px;
                background:rgba(255,255,255,0.07);
            ">
                Fonctionnalités principales
            </div>

            <div style="
                padding:15px;
                border-radius:12px;
                background:rgba(255,255,255,0.07);
            ">
                Statistiques
            </div>

        </div>

    </div>

`;

}

/* =========================
HISTORIQUE
========================= */

function recupererHistorique() {

try {

    return JSON.parse(
        localStorage.getItem(
            "dreamAIHistory"
        )
    ) || [];

} catch {

    return [];

}

}

function sauvegarderDansHistorique(
project
) {

try {

    let historique =
        recupererHistorique();


    /* Évite les doublons */

    historique =
        historique.filter(
            item =>
                item.id !== project.id
        );


    historique.unshift(project);


    historique =
        historique.slice(0, 20);


    localStorage.setItem(
        "dreamAIHistory",
        JSON.stringify(historique)
    );


    afficherHistorique();


} catch (error) {

    console.error(
        "Erreur historique :",
        error
    );

}

}

function afficherHistorique() {

if (!historyList) {
    return;
}


const historique =
    recupererHistorique();


if (historique.length === 0) {

    historyList.innerHTML =
        "<p>Aucun projet sauvegardé.</p>";

    return;

}


historyList.innerHTML =
    historique
        .map(
            (project, index) => `

            <div
                class="history-item"
                data-index="${index}"
                style="cursor:pointer;"
            >

                <strong>
                    ${escapeHTML(
                        project.name ||
                        "Projet sans nom"
                    )}
                </strong>

                <p>
                    ${escapeHTML(
                        project.summary ||
                        project.idea ||
                        ""
                    )}
                </p>

                <small>
                    ${escapeHTML(
                        project.date ||
                        ""
                    )}
                </small>

            </div>

        `
        )
        .join("");


document
    .querySelectorAll(
        ".history-item"
    )
    .forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        item.dataset.index
                    );


                chargerProjetHistorique(
                    historique[index]
                );

            }
        );

    });

}

/* =========================
CHARGER PROJET
========================= */

function chargerProjetHistorique(
project
) {

if (!project) {
    return;
}


currentProject = project;


if (textarea) {

    textarea.value =
        project.idea || "";

    textarea.dispatchEvent(
        new Event("input")
    );

}


if (resultName) {
    resultName.textContent =
        project.name || "";
}


if (resultSummary) {
    resultSummary.textContent =
        project.summary || "";
}


if (resultConcept) {
    resultConcept.textContent =
        project.concept || "";
}


afficherListe(
    resultFeatures,
    project.features || ""
);


afficherListe(
    resultSteps,
    project.steps || ""
);


afficherListe(
    resultIdeas,
    project.improvements || ""
);


if (resultMoney) {

    resultMoney.textContent =
        project.money || "";

}


afficherScore(
    project.score || 0
);


genererInterfacePreview(
    project.name ||
    "Projet DREAM AI"
);


afficherResultat(true);


if (historySection) {
    historySection.hidden = true;
}


showToast(
    "Projet chargé ✅"
);


setTimeout(() => {

    if (result) {

        result.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}, 100);

}

/* =========================
SAUVEGARDER
========================= */

if (saveButton) {

saveButton.addEventListener(
    "click",
    () => {

        if (!currentProject) {

            showToast(
                "Analyse d'abord une idée."
            );

            return;
        }


        try {

            localStorage.setItem(
                "dreamAISaved",
                JSON.stringify(
                    currentProject
                )
            );


            saveButton.textContent =
                "✅ Sauvegardé";


            showToast(
                "Projet sauvegardé !"
            );


        } catch (error) {

            console.error(error);

            showToast(
                "Impossible de sauvegarder."
            );

        }

    }
);

}

/* =========================
AMÉLIORER
========================= */

if (improveButton) {

improveButton.addEventListener(
    "click",
    async () => {

        if (!currentProject) {

            showToast(
                "Analyse d'abord une idée."
            );

            return;
        }


        const nouvelleIdee =
            currentProject.idea +
            "\n\nAméliore cette idée : rends-la plus originale, plus utile et plus réaliste.";


        if (textarea) {

            textarea.value =
                nouvelleIdee;

            textarea.dispatchEvent(
                new Event("input")
            );

            textarea.focus();

        }


        showToast(
            "Idée améliorée ✨ Clique sur Analyser."
        );

    }
);

}

/* =========================
EXPORTER
========================= */

if (exportButton) {

exportButton.addEventListener(
    "click",
    () => {

        if (!currentProject) {

            showToast(
                "Aucun projet à exporter."
            );

            return;
        }


        const contenu = `

DREAM AI

NOM DU PROJET
${currentProject.name}

RÉSUMÉ
${currentProject.summary}

CONCEPT
${currentProject.concept}

FONCTIONNALITÉS
${currentProject.features}

ÉTAPES
${currentProject.steps}

AMÉLIORATIONS
${currentProject.improvements}

MONÉTISATION
${currentProject.money}

NOTE
${currentProject.score}/100

IDÉE ORIGINALE
${currentProject.idea}

==============================
Généré avec DREAM AI

`;

        const blob =
            new Blob(
                [contenu],
                {
                    type:
                        "text/plain;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "dream-ai-projet.txt";


        document.body.appendChild(link);

        link.click();

        link.remove();


        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);


        showToast(
            "Projet exporté 📥"
        );

    }
);

}

/* =========================
NOUVELLE IDÉE
========================= */

if (resetButton) {

resetButton.addEventListener(
    "click",
    () => {

        currentProject = null;


        if (textarea) {

            textarea.value = "";

            textarea.dispatchEvent(
                new Event("input")
            );

        }


        afficherResultat(false);

        afficherChargement(false);


        if (hero) {
            hero.style.opacity = "1";
        }


        if (saveButton) {
            saveButton.textContent =
                "💾 Sauvegarder";
        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        showToast(
            "Prêt pour une nouvelle idée 🚀"
        );

    }
);

}

/* =========================
THÈME
========================= */

function appliquerTheme(theme) {

const light =
    theme === "light";


document.body.classList.toggle(
    "light-mode",
    light
);


if (themeButton) {

    themeButton.textContent =
        light ? "🌙" : "☀️";

}


localStorage.setItem(
    "dreamAITheme",
    light ? "light" : "dark"
);

}

if (themeButton) {

themeButton.addEventListener(
    "click",
    () => {

        const light =
            document.body.classList.contains(
                "light-mode"
            );


        appliquerTheme(
            light
                ? "dark"
                : "light"
        );

    }
);

}

const savedTheme =
localStorage.getItem(
"dreamAITheme"
);

if (savedTheme) {
appliquerTheme(savedTheme);
}

/* =========================
HISTORIQUE — BOUTON
========================= */

if (historyButton) {

historyButton.addEventListener(
    "click",
    () => {

        afficherHistorique();


        if (historySection) {

            historySection.hidden =
                !historySection.hidden;


            if (!historySection.hidden) {

                historySection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }

    }
);

}

/* =========================
FERMER HISTORIQUE
========================= */

if (closeHistory) {

closeHistory.addEventListener(
    "click",
    () => {

        if (historySection) {
            historySection.hidden = true;
        }

    }
);

}

/* =========================
LANGUE
========================= */

if (languageButton) {

languageButton.addEventListener(
    "click",
    () => {

        const languages =
            ["FR", "EN", "AR"];


        const current =
            languageButton.textContent
                .trim();


        const index =
            languages.indexOf(current);


        const next =
            languages[
                (index + 1) %
                languages.length
            ];


        languageButton.textContent =
            next;


        showToast(
            "Langue : " + next
        );

    }
);

}

/* =========================
PREMIUM
========================= */

if (premiumButton) {

premiumButton.addEventListener(
    "click",
    () => {

        showToast(
            "DREAM AI Premium arrive bientôt ⭐"
        );

    }
);

}

/* =========================
PROJET SAUVEGARDÉ
========================= */

const savedProject =
localStorage.getItem(
"dreamAISaved"
);

if (savedProject) {

try {

    currentProject =
        JSON.parse(
            savedProject
        );

} catch {

    currentProject = null;

}

}

/* =========================
INITIALISATION
========================= */

if (loading) {
loading.hidden = true;
}

if (result) {
result.hidden = true;
}

if (historySection) {
historySection.hidden = true;
}

afficherHistorique();

console.log(
"🚀 DREAM AI chargé avec succès."
);