document.addEventListener('DOMContentLoaded', () => {
    let totalPrice = 0;
    let formData = new FormData(document.getElementById('bookingForm'));
    const selectedRooms = {};
    const selectedFoodMenu = {};

    function saveFormData() {
        formData = new FormData(document.getElementById('bookingForm'));
    }

    function restoreFormData() {
        formData.forEach((value, key) => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = value;
            }
        });
    }

    function updateTotalPrice() {
        document.getElementById('SumTotal').textContent = `₪${totalPrice}`;
    }

    function generateBookingSummary() {
        let summary = "סיכום הזמנה לשבת אירוח:\n\n";
        const formData = new FormData(document.getElementById('bookingForm'));

        summary += `שם: ${formData.get('name')}\n`;
        summary += `אימייל: ${formData.get('email')}\n`;
        summary += `טלפון: ${formData.get('phone')}\n`;
        summary += `${document.getElementById('dayOfWeekResult').innerText} ${formData.get('OrderDate')}\n\n`;

        let complexGroups = {};
        for (const [key, room] of Object.entries(selectedRooms)) {
            if (!complexGroups[room.complex]) {
                complexGroups[room.complex] = [];
            }
            complexGroups[room.complex].push(room);
        }

        for (const [complex, rooms] of Object.entries(complexGroups)) {
            summary += `*${complex}*:\n`;
            rooms.forEach(room => {
                summary += `- חדר ${room.number} (₪${room.price})\n`;
            });
            summary += '\n';
        }

        summary += '*תפריט שנבחר*\n';
        for (const item in selectedFoodMenu) {
            summary += `- ${item}\n`;
        }

        const specialRequests = formData.get('specialRequests');
        if (specialRequests) {
            summary += `\nבקשות מיוחדות: ${specialRequests}\n`;
        }

        summary += `\nסה"כ לתשלום: ₪${totalPrice}`;
        return summary;
    }

    function shareOnWhatsApp() {
        const summary = generateBookingSummary();
        const encodedSummary = encodeURIComponent(summary);
        window.open(`https://wa.me/+972547431304?text=${encodedSummary}`, '_blank');
    }

    function shareOnMail() {
        const summary = generateBookingSummary();
        const encodedSummary = encodeURIComponent(summary);
        window.location.href = `mailto:?subject=סיכום הזמנה לשבת אירוח&body=${encodedSummary}`;
    }

    // Event listeners
    document.querySelectorAll('.room').forEach(room => {
        room.addEventListener('click', function() {
            const roomNumber = this.dataset.room;
            const roomPrice = parseInt(this.dataset.price);
            const complexId = this.closest('.hidden-menu').id;
            const complexName = complexId === 'ulpena' ? 'אולפנה' : 'ישיבה תיכונית';
            const placeId = this.closest('.places').id;
            const placeName = placeId === 'place-a' ? 'מתחם ראשי' : 'מתחם חדש';

            const roomKey = `${complexId}-${roomNumber}`;

            if (this.classList.toggle('selected')) {
                selectedRooms[roomKey] = { complex: complexName, number: roomNumber, price: roomPrice };
                totalPrice += roomPrice;
            } else {
                delete selectedRooms[roomKey];
                totalPrice -= roomPrice;
            }

            updateTotalPrice();
        });
    });

    document.querySelectorAll('input[name="menu"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const menuName = this.value;
            const menuPrice = parseInt(this.dataset.price);

            if (isNaN(menuPrice)) {
                console.error(`Invalid price for menu item: ${menuName}`);
                return;
            }

            if (this.checked) {
                selectedFoodMenu[menuName] = menuPrice;
                totalPrice += menuPrice;
            } else {
                if (menuName in selectedFoodMenu) {
                    totalPrice -= selectedFoodMenu[menuName];
                    delete selectedFoodMenu[menuName];
                }
            }

            updateTotalPrice();
        });
    });

    document.getElementById('OrderDate').addEventListener('change', function() {
        const date = new Date(this.value);
        const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
        document.getElementById('dayOfWeekResult').innerText = daysOfWeek[date.getDay()];

        document.querySelectorAll('.hidden-menu').forEach(menu => menu.classList.remove('active'));
        if (date.getDay() === 6) {
            document.getElementById('Saturday').classList.add('active');
        } else {
            document.getElementById('MidWeek').classList.add('active');
        }
    });

    document.querySelectorAll('button[name="option"]').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            saveFormData();

            document.querySelectorAll('#locations span').forEach(location => location.classList.remove('active'));
            document.getElementById(this.value).classList.add('active');

            restoreFormData();
        });
    });

    // Share buttons
    document.getElementById('WhatsappShare').addEventListener('click', shareOnWhatsApp);
    document.getElementById('MailShare').addEventListener('click', shareOnMail);
});
