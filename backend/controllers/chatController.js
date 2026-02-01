const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Profile = require('../models/Profile');
const User = require('../models/User');

// Get all conversations for current user
const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('[ChatDebug] Getting conversations for userId:', userId);

        const conversations = await Conversation.find({
            participants: userId,
            isActive: true
        })
            .sort({ lastMessageAt: -1 })
            .lean();

        console.log('[ChatDebug] Found conversations:', conversations.length);

        // Enrich with participant info
        const enrichedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const otherUserId = conv.participants.find(
                    p => p.toString() !== userId.toString()
                );

                const otherProfile = await Profile.findOne({ user_id: otherUserId }).lean();

                // When using .lean(), Map becomes a plain object
                // Handle both Map and plain object access
                let unreadCount = 0;
                if (conv.unreadCounts) {
                    if (typeof conv.unreadCounts.get === 'function') {
                        unreadCount = conv.unreadCounts.get(userId.toString()) || 0;
                    } else if (typeof conv.unreadCounts === 'object') {
                        unreadCount = conv.unreadCounts[userId.toString()] || 0;
                    }
                }

                return {
                    id: conv._id,
                    participant: {
                        id: otherUserId,
                        name: otherProfile?.full_name || 'User',
                        username: otherProfile?.username || '',
                        avatar: otherProfile?.avatar_url || ''
                    },
                    lastMessage: conv.lastMessage,
                    lastMessageAt: conv.lastMessageAt,
                    unreadCount
                };
            })
        );

        res.json(enrichedConversations);
    } catch (err) {
        console.error('Error fetching conversations:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get or create conversation with a specific user
const getOrCreateConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetUserId, targetUsername } = req.body;

        let targetId = targetUserId;

        // If username provided instead of ID, look up the user
        if (!targetId && targetUsername) {
            const targetProfile = await Profile.findOne({
                username: targetUsername.toLowerCase()
            });
            if (!targetProfile) {
                return res.status(404).json({ error: 'User not found' });
            }
            targetId = targetProfile.user_id;
        }

        if (!targetId) {
            return res.status(400).json({ error: 'Target user required' });
        }

        // Can't message yourself
        if (targetId.toString() === userId.toString()) {
            return res.status(400).json({ error: 'Cannot message yourself' });
        }

        // Check if conversation exists
        let conversation = await Conversation.findBetweenUsers(userId, targetId);

        if (!conversation) {
            // Create new conversation
            conversation = new Conversation({
                participants: [userId, targetId],
                unreadCounts: new Map()
            });
            await conversation.save();
        }

        // Get participant info
        const targetProfile = await Profile.findOne({ user_id: targetId }).lean();

        res.json({
            id: conversation._id,
            participant: {
                id: targetId,
                name: targetProfile?.full_name || 'User',
                username: targetProfile?.username || '',
                avatar: targetProfile?.avatar_url || ''
            },
            lastMessage: conversation.lastMessage,
            lastMessageAt: conversation.lastMessageAt,
            isNew: !conversation.lastMessage
        });
    } catch (err) {
        console.error('Error getting/creating conversation:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // Verify user is participant
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const messages = await Message.find({ conversation_id: conversationId })
            .sort({ created_at: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        // Mark unread messages as read
        await Message.updateMany(
            {
                conversation_id: conversationId,
                sender_id: { $ne: userId },
                read: false
            },
            { read: true, readAt: new Date() }
        );

        // Reset unread count
        conversation.unreadCounts.set(userId.toString(), 0);
        await conversation.save();

        res.json(messages.reverse()); // Return in chronological order
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Send a message
const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId, content, type = 'text' } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ error: 'Message content required' });
        }

        // Verify user is participant
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Create message
        const message = new Message({
            conversation_id: conversationId,
            sender_id: userId,
            content: content.trim(),
            type
        });
        await message.save();

        // Update conversation
        conversation.lastMessage = content.trim().substring(0, 100);
        conversation.lastMessageAt = new Date();
        conversation.lastMessageBy = userId;

        // Increment unread for other participant
        const otherUserId = conversation.participants.find(
            p => p.toString() !== userId.toString()
        );
        const currentUnread = conversation.unreadCounts.get(otherUserId.toString()) || 0;
        conversation.unreadCounts.set(otherUserId.toString(), currentUnread + 1);
        await conversation.save();

        // Emit via Socket.io
        if (req.io) {
            req.io.to(`chat_${conversationId}`).emit('newMessage', {
                message: {
                    id: message._id,
                    content: message.content,
                    type: message.type,
                    sender_id: message.sender_id,
                    created_at: message.created_at,
                    read: message.read
                },
                conversationId
            });

            // Also emit to user's personal room for notification
            req.io.to(`user_${otherUserId}`).emit('messageNotification', {
                conversationId,
                senderId: userId,
                preview: content.trim().substring(0, 50)
            });
        }

        res.json({
            id: message._id,
            content: message.content,
            type: message.type,
            sender_id: message.sender_id,
            created_at: message.created_at,
            read: message.read
        });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Mark conversation as read
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Mark all messages as read
        await Message.updateMany(
            {
                conversation_id: conversationId,
                sender_id: { $ne: userId },
                read: false
            },
            { read: true, readAt: new Date() }
        );

        // Reset unread count
        conversation.unreadCounts.set(userId.toString(), 0);
        await conversation.save();

        res.json({ success: true });
    } catch (err) {
        console.error('Error marking as read:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get total unread count for user
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.find({
            participants: userId,
            isActive: true
        }).lean();

        let totalUnread = 0;
        conversations.forEach(conv => {
            // Handle both Map and plain object access
            if (conv.unreadCounts) {
                if (typeof conv.unreadCounts.get === 'function') {
                    totalUnread += conv.unreadCounts.get(userId.toString()) || 0;
                } else if (typeof conv.unreadCounts === 'object') {
                    totalUnread += conv.unreadCounts[userId.toString()] || 0;
                }
            }
        });

        res.json({ unreadCount: totalUnread });
    } catch (err) {
        console.error('Error fetching unread count:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadCount
};
