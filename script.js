const API_URL = "https://dream-ai-backend-op32.onrender.com/api/analyze";

const SUPABASE_URL = "https://wjidmjstomsxsbyzrisu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_sPpBRJe5BtVw7yQFfjRNuA_UlqJFNXy";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

let currentProject = null;
let currentUser = null;

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
AUTH
========================= */

function creerInterfaceAuth() {

    const header = document.querySelector("header");

    if (!header || document.getElementById("auth-btn")) {
        return;
    }

    const authButton = document.createElement("button");

    authButton.id = "auth-btn";
    authButton.textContent = "👤 Connexion";
    authButton.className = "top-btn";

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

        try {

            if (inscription) {

                const { data, error } =
                    await supabaseClient.auth.signUp({
                        email,
                        password
                    });

                if (error) {
                    message.textContent = error.message;
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

                if (error) {
                    message.textContent = error.message;
                    return;
                }

                currentUser = data.user;

                modal.remove();

                afficherUtilisateur();

                await chargerHistoriqueSupabase();

                showToast(
                    "Connexion réussie 👋"
                );
            }

        } catch (error) {

            console.error(error);

            message.textContent =
                "Une erreur est survenue.";

        } finally {

            submit.disabled = false;
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

    if (!currentUser) {
        return;
    }

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
    currentProject = null;

    afficherUtilisateur();

    if (historyList) {
        historyList.innerHTML =
            "<p class='empty-history'>Connecte-toi pour voir tes projets.</p>";
    }

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

    if (currentUser) {
        await chargerHistoriqueSupabase();
    }

    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {

            currentUser =
                session
                    ? session.user
                    : null;

            afficherUtilisateur();

            if (currentUser) {
                await chargerHistoriqueSupabase();
            } else if (historyList) {
                historyList.innerHTML =
                    "<p class='empty-history'>Connecte-toi pour voir tes projets.</p>";
            }
        }
    );
}

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
        hero.style.opacity =
            visible ? "0.7" : "1";
    }
}

function afficherResultat(visible) {

    if (!result) {
        return;
    }

    result.hidden = !visible;
    result.style.display = "";
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
LISTES
========================= */

function transformerEnListe(text) {

    if (!text) {
        return [];
    }

    if (Array.isArray(text)) {
        return text
            .map(item => String(item).trim())
            .filter(Boolean);
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

            if (!response.ok) {

                throw new Error(
                    "Erreur serveur : " +
                    response.status
                );
            }

            const data =
                await response.json();

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
AFFICHER RESULTAT IA
========================= */

function afficherResultatIA(text, idea) {

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

        id: null,

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
            new Date().toLocaleString("fr-FR")

    };

    if (resultName) {
        resultName.textContent =
            currentProject.name;
    }

    if (resultSummary) {
        resultSummary.textContent =
            currentProject.summary;
    }

    if (resultConcept) {
        resultConcept.textContent =
            currentProject.concept;
    }

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

    if (resultMoney) {

        resultMoney.textContent =
            currentProject.money ||
            "Aucune information disponible.";
    }

    afficherScore(
        currentProject.score
    );

    genererInterfacePreview(
        currentProject.name
    );

    afficherChargement(false);

    afficherResultat(true);

    if (saveButton) {
        saveButton.textContent =
            "💾 Sauvegarder";
    }

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

        const score =
            parseInt(match[1], 10);

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
            parseInt(number[1], 10);

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
SUPABASE — SAUVEGARDER
========================= */

async function sauvegarderProjetSupabase(project) {

    if (!currentUser) {

        showToast(
            "Connecte-toi pour sauvegarder ton projet ☁️"
        );

        return false;
    }

    if (!project) {
        return false;
    }

    const projetDB = {

        user_id:
            currentUser.id,

        name:
            project.name || "Projet DREAM AI",

        idea:
            project.idea || "",

        summary:
            project.summary || "",

        concept:
            project.concept || "",

        features:
            transformerEnListe(
                project.features
            ),

        steps:
            transformerEnListe(
                project.steps
            ),

        improvements:
            transformerEnListe(
                project.improvements
            ),

        money:
            project.money || "",

        score:
            Number(project.score) || 0,

        raw:
            project.raw || ""

    };

    try {

        const { data, error } =
            await supabaseClient
                .from("projects")
                .insert(projetDB)
                .select()
                .single();

        if (error) {

            console.error(
                "Erreur Supabase :",
                error
            );

            showToast(
                "Erreur de sauvegarde : " +
                error.message
            );

            return false;
        }

        if (data) {

            currentProject.id =
                data.id;

            currentProject.cloudId =
                data.id;

            currentProject.created_at =
                data.created_at;

        }

        showToast(
            "Projet sauvegardé dans ton compte ☁️"
        );

        if (saveButton) {
            saveButton.textContent =
                "✅ Sauvegardé";
        }

        await chargerHistoriqueSupabase();

        return true;

    } catch (error) {

        console.error(error);

        showToast(
            "Impossible de sauvegarder le projet."
        );

        return false;
    }
}

/* =========================
SUPABASE — HISTORIQUE
========================= */

async function chargerHistoriqueSupabase() {

    if (!historyList) {
        return;
    }

    if (!currentUser) {

        historyList.innerHTML =
            "<p class='empty-history'>Connecte-toi pour voir tes projets.</p>";

        return;
    }

    try {

        const { data, error } =
            await supabaseClient
                .from("projects")
                .select("*")
                .eq("user_id", currentUser.id)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {

            console.error(
                "Erreur historique Supabase :",
                error
            );

            historyList.innerHTML =
                "<p class='empty-history'>Impossible de charger l'historique.</p>";

            return;
        }

        afficherHistoriqueSupabase(
            data || []
        );

    } catch (error) {

        console.error(error);

        historyList.innerHTML =
            "<p class='empty-history'>Erreur de chargement.</p>";
    }
}

function afficherHistoriqueSupabase(projects) {

    if (!historyList) {
        return;
    }

    if (!projects.length) {

        historyList.innerHTML =
            "<p class='empty-history'>Aucun projet sauvegardé.</p>";

        return;
    }

    historyList.innerHTML =
        projects
            .map(
                project => `

                <div
                    class="history-card"
                    data-id="${escapeHTML(project.id)}"
                >

                    <div>

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
                                project.created_at
                                    ? new Date(
                                        project.created_at
                                    ).toLocaleString("fr-FR")
                                    : ""
                            )}
                        </small>

                    </div>

                    <div class="history-actions">

                        <button
                            class="load-project-button"
                            data-id="${escapeHTML(project.id)}"
                        >
                            Ouvrir
                        </button>

                        <button
                            class="delete-project-button"
                            data-id="${escapeHTML(project.id)}"
                        >
                            Supprimer
                        </button>

                    </div>

                </div>

            `
            )
            .join("");

    document
        .querySelectorAll(
            ".load-project-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    await chargerProjetSupabase(
                        button.dataset.id
                    );

                }
            );

        });

    document
        .querySelectorAll(
            ".delete-project-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    await supprimerProjetSupabase(
                        button.dataset.id
                    );

                }
            );

        });
}

/* =========================
CHARGER PROJET SUPABASE
========================= */

async function chargerProjetSupabase(id) {

    if (!currentUser || !id) {
        return;
    }

    try {

        const { data, error } =
            await supabaseClient
                .from("projects")
                .select("*")
                .eq("id", id)
                .eq("user_id", currentUser.id)
                .single();

        if (error) {

            console.error(error);

            showToast(
                "Impossible de charger le projet."
            );

            return;
        }

        chargerProjetHistorique(
            data
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Erreur de chargement."
        );
    }
}

/* =========================
SUPPRIMER PROJET SUPABASE
========================= */

async function supprimerProjetSupabase(id) {

    if (!currentUser || !id) {
        return;
    }

    const confirmation =
        confirm(
            "Supprimer ce projet de ton historique ?"
        );

    if (!confirmation) {
        return;
    }

    try {

        const { error } =
            await supabaseClient
                .from("projects")
                .delete()
                .eq("id", id)
                .eq("user_id", currentUser.id);

        if (error) {

            console.error(error);

            showToast(
                "Impossible de supprimer le projet."
            );

            return;
        }

        showToast(
            "Projet supprimé 🗑️"
        );

        await chargerHistoriqueSupabase();

    } catch (error) {

        console.error(error);

        showToast(
            "Erreur de suppression."
        );
    }
}

/* =========================
CHARGER PROJET
========================= */

function chargerProjetHistorique(project) {

    if (!project) {
        return;
    }

    currentProject = {

        id:
            project.id || null,

        cloudId:
            project.id || null,

        idea:
            project.idea || "",

        name:
            project.name || "Projet DREAM AI",

        summary:
            project.summary || "",

        concept:
            project.concept || "",

        features:
            project.features || [],

        steps:
            project.steps || [],

        improvements:
            project.improvements || [],

        money:
            project.money || "",

        score:
            project.score || 0,

        raw:
            project.raw || "",

        created_at:
            project.created_at || null

    };

    if (textarea) {

        textarea.value =
            currentProject.idea;

        textarea.dispatchEvent(
            new Event("input")
        );
    }

    if (resultName) {
        resultName.textContent =
            currentProject.name;
    }

    if (resultSummary) {
        resultSummary.textContent =
            currentProject.summary;
    }

    if (resultConcept) {
        resultConcept.textContent =
            currentProject.concept;
    }

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

    if (resultMoney) {
        resultMoney.textContent =
            currentProject.money;
    }

    afficherScore(
        currentProject.score
    );

    genererInterfacePreview(
        currentProject.name
    );

    afficherResultat(true);

    if (historySection) {
        historySection.hidden = true;
    }

    if (saveButton) {
        saveButton.textContent =
            "✅ Sauvegardé";
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
SAUVEGARDER — BOUTON
========================= */

if (saveButton) {

    saveButton.addEventListener(
        "click",
        async () => {

            if (!currentProject) {

                showToast(
                    "Analyse d'abord une idée."
                );

                return;
            }

            if (!currentUser) {

                showToast(
                    "Connecte-toi pour sauvegarder ton projet ☁️"
                );

                ouvrirAuth();

                return;
            }

            saveButton.disabled = true;

            await sauvegarderProjetSupabase(
                currentProject
            );

            saveButton.disabled = false;

        }
    );
}

/* =========================
AMÉLIORER
========================= */

if (improveButton) {

    improveButton.addEventListener(
        "click",
        () => {

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
${transformerEnListe(currentProject.features).join("\n")}

ÉTAPES
${transformerEnListe(currentProject.steps).join("\n")}

AMÉLIORATIONS
${transformerEnListe(currentProject.improvements).join("\n")}

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
        "light",
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
                    "light"
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
        async () => {

            if (!currentUser) {

                showToast(
                    "Connecte-toi pour accéder à ton historique ☁️"
                );

                ouvrirAuth();

                return;
            }

            await chargerHistoriqueSupabase();

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

creerInterfaceAuth();

initialiserAuth();

console.log(
    "🚀 DREAM AI chargé avec succès."
);