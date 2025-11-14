import {AppData, UserData } from './AppData';
import { allHabits } from '../Classes/Habit';

class NotificationsManager {
   static BASE_URL = 'https://uml-backend-node.onrender.com/api/notifications';

    /**
     * Gets the current user's ID
     * @private
     * @returns {string} The user's ID
     * @throws {Error} If user is not logged in
     */
    static getUserId() {
        if (!UserData.id) {
            throw new Error('User is not logged in');
        }
        return UserData.id;
    }

    /**
     * Sends a notification to the backend
     * @param {Object} notification - The notification data to send
     * @param {string} notification.type - Type of notification (e.g., 'habit_reminder', 'goal_achieved')
     * @param {string} notification.message - The message content
     * @param {string} [notification.userId] - The ID of the user to notify (optional, will use current user if not provided)
     * @param {Object} [metadata] - Additional metadata for the notification
     * @returns {Promise<Object>} - The response from the server
     */
    static async sendNotification({ type, message, userId, metadata = {} }) {
        const targetUserId = userId || this.getUserId();
        
        try {
            const response = await fetch(this.BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type,
                    message,
                    userId: targetUserId,
                    metadata
                }),
                credentials: 'include' // Important for cookies if using sessions
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    static async sendHabitReminder() {
        if (AppData.choosenHabits.length === 0) return;

        const lang = AppData.prefs[0];
        const userId = this.getUserId();
        
        // Get all active habit names
        const activeHabitNames = AppData.choosenHabits
            .map(id => {
                const habit = allHabits.find(h => h.id === id);
                return habit ? habit.name[lang] : null;
            })
            .filter(name => name !== null);
        
        if (activeHabitNames.length === 0) return;

        const habitsList = activeHabitNames.join(', ');
        const isMultiple = activeHabitNames.length > 1;
        
        // Russian message (lang === 0)
        let message;
        if (lang === 0) {
            message = `⏰ Не забудьте выполнить ${isMultiple ? 'привычки' : 'привычку'}: ${habitsList}`;
        } 
        // English message (lang === 1)
        else {
            message = `⏰ Don't forget to complete your ${isMultiple ? 'habits' : 'habit'}: ${habitsList}`;
        }
        
        return this.sendNotification({
            type: 'habit_reminder',
            message: message,
            userId: userId,
            metadata: {
                habitNames: activeHabitNames,
                isMultiple: isMultiple,
                timestamp: new Date().toISOString(),
                source: 'frontend'
            }
        });
    }

    /**
     * Sends a goal achievement notification
     * @param {string} goalName - The name of the achieved goal
     * @param {string} [customMessage] - Optional custom message
     */
    static async sendGoalAchieved(goalName, customMessage) {
        const userId = this.getUserId();
        const message = customMessage || `🎉 Congratulations! You've achieved your goal: ${goalName}`;
        
        return this.sendNotification({
            type: 'goal_achieved',
            message: message,
            userId: userId,
            metadata: {
                goalName: goalName,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Sends a custom notification
     * @param {string} message - The custom message to send
     * @param {Object} [metadata] - Additional metadata
     */
    static async sendCustomNotification(message, metadata = {}) {
        const userId = this.getUserId();
        return this.sendNotification({
            type: 'custom',
            message: message,
            userId: userId,
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString()
            }
        });
    }
}

export default NotificationsManager;