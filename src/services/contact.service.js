import Contact from '../models/Contact.model.js';

class ContactService {
    /**
     * Create a new contact message
     */
    async createContact(contactData) {
        const contact = new Contact(contactData);
        return await contact.save();
    }

    /**
     * Get all contact messages
     */
    async getAllContacts(sortBy = '-createdAt') {
        return await Contact.find().sort(sortBy).lean();
    }

    /**
     * Get contact message by ID
     */
    async getContactById(contactId) {
        return await Contact.findById(contactId);
    }

    /**
     * Mark contact message as read
     */
    async markAsRead(contactId) {
        return await Contact.findByIdAndUpdate(
            contactId,
            { status: 'read' },
            { new: true }
        );
    }

    /**
     * Delete contact message
     */
    async deleteContact(contactId) {
        return await Contact.findByIdAndDelete(contactId);
    }

    /**
     * Get unread count
     */
    async getUnreadCount() {
        return await Contact.countDocuments({ status: 'unread' });
    }
}

export default new ContactService();
