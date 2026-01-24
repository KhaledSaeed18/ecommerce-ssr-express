import contactService from '../services/contact.service.js';
import categoryService from '../services/category.service.js';

class ContactController {
    /**
     * GET /contact
     * Show contact form
     */
    async showContactForm(req, res) {
        try {
            // Get all active categories for footer
            const categories = await categoryService.getAllCategories(false);

            res.render('contact', {
                layout: 'layouts/main',
                title: 'Contact Us',
                categories,
                csrfToken: req.csrfToken ? req.csrfToken() : null,
                success: req.query.success === 'true',
                error: req.query.error
            });
        } catch (error) {
            console.error('Contact form error:', error);
            res.status(500).send('Error loading contact form');
        }
    }

    /**
     * POST /contact
     * Submit contact form
     */
    async submitContactForm(req, res) {
        try {
            const { fullName, email, subject, message } = req.body;

            // Validation
            if (!fullName || !email || !subject || !message) {
                return res.redirect('/contact?error=All fields are required');
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.redirect('/contact?error=Invalid email address');
            }

            // Create contact message
            await contactService.createContact({
                fullName: fullName.trim(),
                email: email.trim(),
                subject: subject.trim(),
                message: message.trim()
            });

            res.redirect('/contact?success=true');
        } catch (error) {
            console.error('Contact form submission error:', error);
            res.redirect('/contact?error=Failed to send message. Please try again.');
        }
    }
}

export default new ContactController();
