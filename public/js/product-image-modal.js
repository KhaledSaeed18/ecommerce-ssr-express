// Product Image Modal Functionality
(function () {
    'use strict';

    // Change main image function
    function changeMainImage(imageUrl, thumbnailElement) {
        var mainImage = document.getElementById('mainImage');
        if (!mainImage) return;

        mainImage.style.backgroundImage = "url('" + imageUrl + "')";
        mainImage.setAttribute('data-current-url', imageUrl);

        var thumbnails = document.querySelectorAll('.thumbnail');
        for (var i = 0; i < thumbnails.length; i++) {
            thumbnails[i].style.borderColor = 'transparent';
        }
        thumbnailElement.style.borderColor = 'var(--primary)';
    }

    // Open image modal function
    function openImageModal() {
        var mainImage = document.getElementById('mainImage');
        if (!mainImage) return;

        var currentUrl = mainImage.getAttribute('data-current-url');
        var modal = document.getElementById('imageModal');
        var modalImg = document.getElementById('modalImage');

        if (modal && modalImg && currentUrl) {
            modal.style.display = 'block';
            modalImg.src = currentUrl;
            document.body.style.overflow = 'hidden';
        }
    }

    // Close image modal function
    function closeImageModal() {
        var modal = document.getElementById('imageModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function () {
        // Setup main image click handler
        var mainImage = document.getElementById('mainImage');
        if (mainImage) {
            mainImage.addEventListener('click', openImageModal);
        }

        // Setup thumbnail click handlers
        var thumbnails = document.querySelectorAll('.thumbnail');
        for (var i = 0; i < thumbnails.length; i++) {
            (function (thumb) {
                thumb.addEventListener('click', function () {
                    var imageUrl = thumb.getAttribute('src');
                    changeMainImage(imageUrl, thumb);
                });
            })(thumbnails[i]);
        }

        // Setup modal close handlers
        var modal = document.getElementById('imageModal');
        if (modal) {
            modal.addEventListener('click', closeImageModal);
        }

        var closeBtn = document.querySelector('#imageModal span');
        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                closeImageModal();
            });
        }

        // Prevent modal image from closing modal when clicked
        var modalImg = document.getElementById('modalImage');
        if (modalImg) {
            modalImg.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }

        // Initialize first thumbnail as selected
        var firstThumbnail = document.querySelector('.thumbnail');
        if (firstThumbnail) {
            firstThumbnail.style.borderColor = 'var(--primary)';
        }

        // Close modal on Escape key
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' || event.keyCode === 27) {
                closeImageModal();
            }
        });
    });
})();
