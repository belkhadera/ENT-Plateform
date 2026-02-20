const ChatbotConversation = require('../models/ChatbotConversation');
const axios = require('axios');

// Ollama configuration
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

/**
 * @desc    Send message to AI chatbot (Ollama)
 * @route   POST /api/chatbot/message
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Le message est requis'
      });
    }

    let conversation;

    // Get or create conversation
    if (conversationId) {
      conversation = await ChatbotConversation.findOne({
        _id: conversationId,
        userId
      });
    }

    if (!conversation) {
      conversation = await ChatbotConversation.create({
        userId,
        messages: [],
        title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    });

    // Prepare context for Ollama
    const context = buildContext(req.user, conversation.messages);

    // Call Ollama API
    let aiResponse;
    try {
      aiResponse = await callOllamaAPI(message, context);
    } catch (ollamaError) {
      console.error('Ollama API Error:', ollamaError);
      // Fallback to rule-based response
      aiResponse = generateFallbackResponse(message);
    }

    // Add AI response
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    await conversation.save();

    // Generate suggestions
    const suggestions = generateSuggestions(message, aiResponse);

    res.json({
      success: true,
      conversationId: conversation._id,
      response: aiResponse,
      suggestions: suggestions
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur du chatbot',
      error: error.message
    });
  }
};

/**
 * Call Ollama API for AI response
 */
async function callOllamaAPI(message, context) {
  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: context + '\n\nUtilisateur: ' + message + '\n\nAssistant:',
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 500
      }
    }, {
      timeout: 30000 // 30 seconds timeout
    });

    return response.data.response.trim();
  } catch (error) {
    console.error('Ollama API call failed:', error.message);
    throw error;
  }
}

/**
 * Build context for Ollama
 */
function buildContext(user, messageHistory) {
  let systemPrompt = `Tu es un assistant virtuel intelligent pour l'École Supérieure de Technologie (EST) de Salé, Maroc.

Contexte étudiant:
- Nom: ${user.firstName} ${user.lastName}
- Rôle: ${user.role}
- Email: ${user.email}

Tes responsabilités:
1. Aider les étudiants avec leurs questions académiques
2. Fournir des informations sur les cours, examens, notes
3. Expliquer les procédures administratives
4. Orienter vers les bonnes ressources
5. Être professionnel, courtois et précis

Informations sur l'EST Salé:
- Établissement: École Supérieure de Technologie de Salé
- Université: Mohammed V de Rabat
- Email support: support@est.um5.ac.ma
- Formations: DUT en informatique, électronique, génie mécanique, etc.

Instructions:
- Réponds UNIQUEMENT en français
- Sois concis mais complet (3-5 phrases maximum)
- Utilise des emojis pour rendre les réponses plus engageantes
- Si tu ne connais pas une information spécifique, recommande de contacter l'administration
- Formate tes réponses avec des bullet points (•) quand nécessaire
- Ne fournis JAMAIS d'informations fausses ou inventées

Historique de conversation récent:`;

  // Add last 5 messages for context
  const recentMessages = messageHistory.slice(-5);
  recentMessages.forEach(msg => {
    const role = msg.role === 'user' ? 'Utilisateur' : 'Assistant';
    // Cette ligne fonctionne maintenant car systemPrompt est un 'let'
    systemPrompt += `\n${role}: ${msg.content}`;
  });

  return systemPrompt;
}

/**
 * Generate fallback response (when Ollama fails)
 */
function generateFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Keywords detection
  const keywords = {
    examen: ['examen', 'test', 'contrôle', 'évaluation'],
    note: ['note', 'résultat', 'score', 'moyenne', 'bulletin'],
    cours: ['cours', 'module', 'matière', 'enseignement'],
    inscription: ['inscription', 'inscrire', 'enregistrement'],
    prof: ['professeur', 'enseignant', 'prof', 'teacher'],
    emploi: ['emploi du temps', 'planning', 'horaire', 'calendrier'],
    bibliotheque: ['bibliothèque', 'livre', 'documentation'],
    stage: ['stage', 'internship', 'entreprise']
  };

  // Check which category matches
  for (const [category, terms] of Object.entries(keywords)) {
    if (terms.some(term => lowerMessage.includes(term))) {
      return getResponseForCategory(category);
    }
  }

  // Default response
  return `Je suis là pour vous aider ! 🎓

Je peux répondre à vos questions sur :
• 📚 Les cours et modules
• 📝 Les examens et évaluations
• 📊 Les notes et résultats
• 🎓 Les inscriptions
• 👨‍🏫 Les professeurs
• 📅 L'emploi du temps

Que souhaitez-vous savoir ?`;
}

/**
 * Get response by category
 */
function getResponseForCategory(category) {
  const responses = {
    examen: `📝 **Informations sur les Examens**

• Consultez la section "Examens & Devoirs" pour voir tous vos examens
• Les dates sont affichées dans votre calendrier académique
• Vous recevrez des notifications avant chaque examen

Besoin de détails sur un examen spécifique ?`,

    note: `📊 **Consultation des Notes**

• Allez dans "Notes" pour voir toutes vos notes
• Filtrez par semestre ou par cours
• Votre moyenne générale est calculée automatiquement

Les notes sont publiées après correction par les professeurs.`,

    cours: `📚 **Informations sur les Cours**

• Tous vos cours sont dans "Mes Cours"
• Accédez aux ressources pédagogiques
• Téléchargez les supports de cours
• Contactez vos professeurs via la messagerie

Y a-t-il un cours en particulier ?`,

    inscription: `🎓 **Procédure d'Inscription**

• Connectez-vous ou créez un compte
• Remplissez le formulaire d'inscription
• Validez votre email
• Attendez l'approbation de l'administration

Contact: admin@est.um5.ac.ma`,

    prof: `👨‍🏫 **Contacter un Professeur**

• Utilisez la messagerie interne
• Cliquez sur "Nouveau Message"
• Sélectionnez votre professeur
• Réponse sous 24-48h généralement

Les professeurs sont disponibles pendant leurs heures de permanence.`,

    emploi: `📅 **Emploi du Temps**

• Consultez votre calendrier dans "Calendrier"
• Téléchargez votre emploi du temps
• Les modifications sont mises à jour en temps réel

Activez les notifications pour ne rien manquer !`,

    bibliotheque: `📚 **Bibliothèque Universitaire**

• Accès physique avec votre carte étudiant
• Consultation sur place et prêt de livres
• Ressources numériques disponibles en ligne

Horaires: Lun-Ven 8h-18h, Sam 9h-13h`,

    stage: `💼 **Stages et Entreprises**

• Consultez les offres dans l'espace stages
• Validez votre convention de stage avec l'administration
• Rapport de stage obligatoire en fin de période

Contact service stages: stages@est.um5.ac.ma`
  };

  return responses[category] || generateFallbackResponse('');
}

/**
 * Generate follow-up suggestions
 */
function generateSuggestions(userMessage, aiResponse) {
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = aiResponse.toLowerCase();

  // Context-based suggestions
  if (lowerMessage.includes('examen') || lowerResponse.includes('examen')) {
    return [
      'Comment me préparer ?',
      'Où voir mon calendrier ?',
      'Documents autorisés ?'
    ];
  }

  if (lowerMessage.includes('note') || lowerResponse.includes('note')) {
    return [
      'Comment améliorer ma moyenne ?',
      'Voir mon bulletin',
      'Contester une note'
    ];
  }

  if (lowerMessage.includes('cours')) {
    return [
      'Télécharger les supports',
      'Contacter le prof',
      'Horaires du cours'
    ];
  }

  // Default suggestions
  return [
    'Voir mes examens',
    'Consulter mes notes',
    'Contacter un prof'
  ];
}

/**
 * @desc    Get chat history
 * @route   GET /api/chatbot/history/:conversationId
 * @access  Private
 */
exports.getHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await ChatbotConversation.findOne({
      _id: conversationId,
      userId: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's conversations
 * @route   GET /api/chatbot/conversations
 * @access  Private
 */
exports.getConversations = async (req, res) => {
  try {
    const conversations = await ChatbotConversation.find({
      userId: req.user.id,
      isActive: true
    })
    .sort({ updatedAt: -1 })
    .limit(20);

    res.json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations',
      error: error.message
    });
  }
};

/**
 * @desc    Delete conversation
 * @route   DELETE /api/chatbot/conversations/:conversationId
 * @access  Private
 */
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await ChatbotConversation.findOne({
      _id: conversationId,
      userId: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    conversation.isActive = false;
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation supprimée avec succès'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

/**
 * @desc    Get suggested questions
 * @route   GET /api/chatbot/suggestions
 * @access  Private
 */
exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = [
      { icon: '📅', text: 'Quand sont les prochains examens ?' },
      { icon: '📊', text: 'Comment consulter mes notes ?' },
      { icon: '📚', text: 'Liste des cours disponibles' },
      { icon: '🎓', text: 'Procédure d\'inscription' },
      { icon: '💬', text: 'Contacter un professeur' },
      { icon: '📄', text: 'Documents administratifs' }
    ];

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des suggestions',
      error: error.message
    });
  }
};