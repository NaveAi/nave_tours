let totalPrice = 0;
        let formData = {};
        const selectedRooms = {};
        const selectedFoodMenu = {};
        

        function saveFormData() {
            const form = document.getElementById('bookingForm');
            formData = new FormData(form);
        }

        function restoreFormData() {
            const form = document.getElementById('bookingForm');
            formData.forEach((value, key) => {
                const field = form.elements[key];
                if (field) {
                    field.value = value;
                }
            });
        }

        document.querySelectorAll('.room').forEach(room => {
            room.addEventListener('click', function() {
                const roomNumber = this.dataset.room;
                const roomPrice = parseInt(this.dataset.price);

                const placeId = this.closest('.places').id;
                const placeName = placeId === 'place-a' ? 'מתחם ראשי' :
                                  placeId === 'place-b' ? 'מתחם חדש א' :
                                  placeId === 'place-c' ? 'מתחם חדש ב' :
                                  '';

                const complexId = this.closest('.hidden-menu').id;
                const complexName = complexId === 'ulpena' ? 'אולפנה' : 
                                    complexId === 'yeshiva' && placeId === 'place-a' ? 'ישיבה תיכונית מתחם ראשי' :
                                    complexId === 'yeshiva' && placeId === 'place-b' ? 'ישיבה תיכונית מתחם חדש א' :
                                    complexId === 'yeshiva' && placeId === 'place-c' ? 'ישיבה תיכונית מתחם חדש ב' :
                                    complexId === 'haluzey' ? 'חלוצי דרור':
                                    '';


                
                const roomKey = `${complexId}-${placeId}-${roomNumber}`;

                if (this.classList.toggle('selected')) {
                    // Add room to selectedRooms
                    selectedRooms[roomKey] = { complex: complexName, number: roomNumber, price: roomPrice };
                    totalPrice += roomPrice;
                } else {
                    // Remove room from selectedRooms
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
                    // Add item to selectedFoodMenu and increase totalPrice
                    selectedFoodMenu[menuName] = menuPrice;
                    totalPrice += menuPrice;
                } else {
                    // Remove item from selectedFoodMenu and decrease totalPrice
                    if (menuName in selectedFoodMenu) {
                        totalPrice -= selectedFoodMenu[menuName];
                        delete selectedFoodMenu[menuName];
                    }
                }

                updateTotalPrice();
                console.log("Selected items:", selectedFoodMenu);
                console.log("Total price:", totalPrice);
            });
        });

        document.getElementById('OrderDate').addEventListener('change', function() {
            const date = new Date(this.value);
            const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
            document.getElementById('dayOfWeekResult').innerText = daysOfWeek[date.getDay()];
           

            document.querySelectorAll('.hidden-menu').forEach(menu => menu.classList.remove('active'));
            if (date.getDay() === 6 || date.getDay() === 5) {
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

        function updateTotalPrice() {
            document.getElementById('SumTotal').textContent = `₪${totalPrice}`;
        }

        function generateBookingSummary() {
            const formData = new FormData(document.getElementById('bookingForm'));
            let summary = "סיכום הזמנה לשבת אירוח:\n\n";

            summary += `שם: ${formData.get('name')}\n`;
            summary += `אימייל: ${formData.get('email')}\n`;
            summary += `טלפון: ${formData.get('phone')}\n`;
            summary += `${document.getElementById('dayOfWeekResult').innerText} ${formData.get('OrderDate')}\n\n`;

            //summary += "חדרים שנבחרו:\n\n";
            let complexGroups = {};
                for (const [key, room] of Object.entries(selectedRooms)) {
                    if (!complexGroups[room.complex]) {
                        complexGroups[room.complex] = [];
                    }
                    complexGroups[room.complex].push(room);
                }
    
            // Generate summary for each complex
            for (const [complex, rooms] of Object.entries(complexGroups)) {
                summary += `*${complex}*:\n`;
                rooms.forEach(room => {
                    summary += `- חדר ${room.number} (₪${room.price})\n`;
                });
            summary += '\n'
            }

            // add menu selected
            summary += '*תפריט שנבחר*\n';
            Object.keys(selectedFoodMenu).forEach(item => {
                summary += `- ${item}\n`;
            });


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
