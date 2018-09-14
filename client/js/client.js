"use strict";

// for keeping the current search data in global scope
var globalCardArray;

// MTG colors, transparent
var cardColors = {
    blue: 'rgba(170, 224, 250, 0.3)',
    green: 'rgba(155, 211, 174, 0.3)',
    red: 'rgba(249, 170, 143, 0.3)',
    black: 'rgba(203, 194, 191, 0.3)',
    white: 'rgba(255, 251, 213, 0.3)'
}

// sort by card name
// credit: https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
function sortCardsByName(a, b) {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();

    let comparison = 0;
    if(nameA > nameB) {
        comparison = 1;
    }
    else if (nameA < nameB) {
        comparison = -1;
    }

    return comparison;
}

// 'expands' clicked card on screen with a lightbox and more info about the card
function expandCard(e) {
    // determine which card was clicked
    for(var i = 0; i < globalCardArray.length; i++) {
        if($(e.target).hasClass(i)) {
            // find the card from within the global array
            var card = globalCardArray[i];

            // create lightbox element
            var lightbox = document.createElement('div');

            lightbox.style.position = "fixed";
            lightbox.style.top = 0;
            lightbox.style.left = 0;
            lightbox.style.width = "100%";
            lightbox.style.height = "100%";
            lightbox.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            lightbox.style.display = "none";
            lightbox.style.zIndex = "2";

            // setup card item to expand
            var cardArea = document.createElement('div');
            var cardAreaSub = document.createElement('div');

            $(cardAreaSub).addClass("cardExpandedData");

            var cardSummary = document.createElement('div');
            var cardSummaryData = document.createElement('div');
            var cardInfo = document.createElement('div');
            var cardInfoData = document.createElement('div');

            $(cardSummary).addClass('card-summary');
            $(cardSummaryData).addClass('card-summary-data');
            $(cardInfo).addClass('card-info');
            $(cardInfoData).addClass('card-info-data');

            var cardName, 
                cardDesc,
                cardImage, 
                cardColors, 
                cardSet, 
                cardType, 
                cardSubTypes, 
                cardArtist, 
                cardFlavor, 
                cardManaCost, 
                cardGameFormat,
                cardLegalities,
                cardPower, 
                cardToughness,
                cardRarity;

            // assign local variables to card data, or alt values if applicable
            cardName = card.name || "No card name available";
            cardDesc = card.text || null;
            cardImage = card.imageUrl || "No card image available";
            cardColors = card.colors || ["No card colors available"];
            cardSet = card.setName || "No card set available";
            cardType = card.type || "No card type available";
            cardSubTypes = card.subTypes || ["No card subtypes available"];
            cardArtist = card.artist || "No card artist available";
            cardFlavor = card.flavor || null;
            cardManaCost = card.manaCost || "No card mana cost available";
            cardLegalities = card.legalities || null;
            cardPower = card.power || "No card power available";
            cardToughness = card.toughness || "No card toughness available";
            cardRarity = card.rarity || "No card rarity available";

            var imageContainer = document.createElement('div');
            imageContainer.style.textAlign = "center";

            var image = document.createElement('img');
            $(image).attr("src", cardImage);
            $(image).attr("alt", cardImage);
            $(image).css("width", "300px");
            $(image).css("height", "auto");
            imageContainer.append(image);

            cardSummaryData.append(imageContainer);

            var nameElement = document.createElement('p');
            nameElement.textContent = cardName;
            $(nameElement).addClass("cardItemName");
            $(nameElement).css("font-size", "1.8em");
            nameElement.style.margin = "0";
            nameElement.style.marginTop = "29px";

            cardSummaryData.append(nameElement);
            cardSummary.append(cardSummaryData);

            var infoName = document.createElement('p');
            var infoManaCost = document.createElement('p');
            var infoColors = document.createElement('p');
            var infoType = document.createElement('p');
            var infoPowerTough = document.createElement('p');
            var infoSet = document.createElement('p');
            var infoArtist = document.createElement('p');
            var infoRarity = document.createElement('p');

            infoName.textContent = "Name: " + cardName;
            infoManaCost.textContent = "Mana Cost: " + cardManaCost;

            infoColors.textContent = "Colors: " + cardColors.join(', ');

            infoType.textContent = "Type: " + cardType;
            infoPowerTough.textContent = "Power/Toughness: " + cardPower + "/" + cardToughness;
            infoSet.textContent = "Set: " + cardSet;

            // define the description
            var infoDesc = null;
            if(cardDesc != null) {
                infoDesc = document.createElement('div');
                infoDesc.textContent = "Description:";

                var descP = document.createElement('p');
                descP.style.padding = "0";
                descP.style.paddingLeft = "13px";
                descP.style.margin = "0";

                descP.textContent = cardDesc;

                infoDesc.style.paddingBottom = "16px";
                infoDesc.append(descP);
            }
            else {
                infoDesc = document.createElement('p');
                infoDesc.textContent = "No description available";
            }

            // define the flavor text
            var infoFlavor = null;
            if(cardFlavor != null) {
                infoFlavor = document.createElement('div');
                infoFlavor.textContent = "Flavor:";

                var flavorP = document.createElement('p');
                flavorP.style.fontStyle = "italic";
                flavorP.style.padding = "0";
                flavorP.style.paddingLeft = "13px";
                flavorP.style.margin = "0";

                flavorP.textContent = cardFlavor;

                infoFlavor.append(flavorP);
            }
            else {
                infoFlavor = document.createElement('p');
                infoFlavor.textContent = "No flavor content available";
            }

            // define legalities
            var infoLegalities = null;

            // if there are legalities, create a div and populate it with p's for each format
            if(cardLegalities != null) { 
                infoLegalities = document.createElement('div');

                infoLegalities.textContent = "Legalities";

                for(var k = 0; k < cardLegalities.length; k++) {
                    var newFormatP = document.createElement('p');

                    newFormatP.style.padding = "0";
                    newFormatP.style.paddingLeft = "13px";
                    newFormatP.style.margin = "0";

                    var curFormat = cardLegalities[k];
                    newFormatP.textContent = "Format: " + curFormat.format + ", " + curFormat.legality;

                    infoLegalities.append(newFormatP);
                }
            }
            // else, just create a single p saying there are no legalities
            else { 
                infoLegalities = document.createElement('p');
                infoLegalities.textContent = "No card legalities available";
            }

            infoRarity.textContent = "Rarity: " + cardRarity;
            infoArtist.textContent = "Artist: " + cardArtist;

            cardInfoData.append(infoName);
            cardInfoData.append(infoManaCost);
            cardInfoData.append(infoColors);
            cardInfoData.append(infoType);
            cardInfoData.append(infoPowerTough);
            cardInfoData.append(infoSet);
            cardInfoData.append(infoDesc);
            cardInfoData.append(infoFlavor);
            cardInfoData.append(infoRarity);
            cardInfoData.append(infoLegalities);
            cardInfoData.append(infoArtist);

            cardInfo.append(cardInfoData);

            cardAreaSub.append(cardSummary);
            cardAreaSub.append(cardInfo);

            cardArea.append(cardAreaSub);

            $(cardArea).ready(function() {
                var areaWidth = 1000;
                var areaHeight = 800;
                var paddingAmt = 20;

                cardArea.style.position = "absolute";
                cardArea.style.width = areaWidth + "px";
                cardArea.style.height = areaHeight + "px";
                cardArea.style.padding = paddingAmt + "px";

                // adjust actual height and width to account for padding
                // for when actually placing the element
                areaHeight += paddingAmt * 2;
                areaWidth += paddingAmt * 2;

                var diffWidth = window.innerWidth / 2 - areaWidth / 2;
                var diffHeight = window.innerHeight / 2 - areaHeight / 2;

                cardArea.style.top = diffHeight + "px";
                cardArea.style.left = diffWidth + "px";

                cardArea.style.backgroundColor = "rgba(90, 90, 90, .8)";
                cardArea.style.display = "none";

                lightbox.append(cardArea);
                document.body.append(lightbox);
                $(lightbox).fadeIn(200, function() {
                    $(cardArea).slideDown(200);
                });
            });

            // when the user clicks anywhere, fade out and remove the lightbox
            $(lightbox).click(function() {
                $(lightbox).fadeOut(200, function() {
                    lightbox.remove();
                }) 
            });
        }
    }
}

// grab color data, and if it's part of a multi-color card
function getCardColor(colorData) {
    var color = '';

    switch(colorData) {
        case 'Blue':
            color = cardColors.blue;
            break;
        case 'Green':
            color = cardColors.green;
            break;
        case 'Red':
            color = cardColors.red;
            break;
        case 'Black':
            color = cardColors.black; 
            break;
        case 'White':
            color = cardColors.white; 
            break;
        default:
            color = 'rgba(50,50,50,0.6)';
            break;
    }

    return color;
}

// set and place card data with given searchData
function setCards(searchData) {
    // remove all previous children within result
    $("#result").empty();

    // sort cards by card name
    searchData.sort(sortCardsByName);

    // set the globalCardArray for this query
    globalCardArray = searchData;

    //var currentCard = 0;
    var row = null;
    var rowItems = null;

    // for skipping duplicate cards
    var usedNames = []; // for when we check if the card name is the same
    var usedArtists = []; // for when we check if the artist is the same (indicating same image)
    var cardsUsed = 0;

    if (searchData.length > 0) {
        for(var currentCard = 0; currentCard < searchData.length; currentCard++) {
            var currentMod = cardsUsed % 3;

            var dataImageUrl = searchData[currentCard].imageUrl; // image
            var dataName = searchData[currentCard].name; // name
            var dataArtist = searchData[currentCard].artist; // artist
            var dataDesc = searchData[currentCard].text; // description/text
            var dataColors = searchData[currentCard].colors || null; // card color
            var dataSetName = searchData[currentCard].setName; // the set it belongs to

            // skip card if name is the same AND the artist is the same
            // if name and artist are same, indicates exact duplicate
            if(usedNames.includes(dataName) && usedArtists.includes(dataArtist)) {
                //console.dir("Skipping card: " + dataName);
                continue;
            }
            else {
                cardsUsed++;
            }

            // push name and artist data to the used data arrays
            usedNames.push(dataName);
            usedArtists.push(dataArtist);

            // begin setting up new dom elements for the cards
            // if the currentCard is a multiple of 3, start a new row
            if(currentMod == 0) {
                row = document.createElement('div'); // create new div
                $(row).addClass('cardRow'); // assign cardRow class to row
                $("#result").append(row); // add row to results seciton

                rowItems = []; // reset rowItems
            }

            // assign this card's elements
            var divItem,
                divImage,
                imgCard,
                pName,
                pDesc;

            // create item wrapper div
            divItem = document.createElement('div');
            $(divItem).addClass(currentCard.toString());
            $(divItem).addClass('cardRowItem');

            var gradientDiv = null;

            // set hover colors/gradients
            if (dataColors != null) {
                if (dataColors.length > 1) {
                    // get all colors of the card and set a linear gradient of all of them for a background
                    var colors = [];

                    for(var k = 0; k < dataColors.length; k++) {
                        colors.push(getCardColor(dataColors[k]));
                    }

                    gradientDiv = document.createElement('div');
                    $(gradientDiv).addClass(currentCard.toString());
                    $(gradientDiv).addClass('gradient-div');

                    var gradientString = "linear-gradient(to right, ";
                    var colorsString = colors.join(", ");
                    gradientString = gradientString.concat(colorsString) + ")";

                    $(gradientDiv).css({
                        "background": gradientString
                    });

                    divItem.append(gradientDiv);

                    // fade listeners for gradiented backgrounds
                    // fade rather than css transition since gradients are treated differently
                    $(divItem).hover(function() {
                        var child = $(this).children()[0];
                        $(child).fadeIn(200);
                    }, function() {
                        var child = $(this).children()[0];
                        $(child).fadeOut(200);
                    });
                }
                else {
                    var color = getCardColor(dataColors[0]);
                    divItem.color = color;

                    // css transitions based on hovering
                    $(divItem).hover(function() {
                        $(this).css("background", this.color);
                    }, function() {
                        $(this).css('background', 'rgba(0,0,0,0)');
                    });
                }
            }

            // create image wrapping div
            divImage = document.createElement('div'); // img div wrapper 
            $(divImage).addClass('cardItemImage')

            // create img element and assign it's src to the imageUrl of it's card
            imgCard = document.createElement('img'); // img within it's wrapper 
            $(imgCard).attr("src", dataImageUrl);
            divImage.append(imgCard);

            // create name paragraph element and set it's text to the name of it's card
            pName = document.createElement('p'); // card name paragraph
            $(pName).addClass('cardItemName');
            $(pName).text(dataName);

            // create description paragraph element and set it's text to the text of it's card
            pDesc = document.createElement('p'); // card description paragraph
            $(pDesc).addClass('cardItemDesc');
            $(pDesc).text(dataDesc);

            var clickCollider = document.createElement('div');
            $(clickCollider).addClass(currentCard.toString()); // unique identifier
            $(clickCollider).addClass("click-collider");

            $(clickCollider).click(expandCard); // expand listener

            // append image, name, and description to the row item
            divItem.append(divImage);
            divItem.append(pName);
            divItem.append(pDesc);

            // append the collider div to the item
            divItem.append(clickCollider);

            // push item to rowItems array
            rowItems.push(divItem);

            // add latest row item to the row
            row.append(rowItems[currentMod]);
        }
        
        var resultsText = '';

        if (cardsUsed == 1) {
            resultsText = "1 result found";
        }
        else {
            resultsText = cardsUsed + " results found";
        }
        
        // set results counter text to amount of cards displayed
        $("#count-text").text(resultsText);
    }
    // if there are no results, display 'no results' within the results section
    else {
        // similar to any card item as seen above, imitating it for styling's sake
        var row = document.createElement('div');
        $(row).addClass('cardRow');
        $("#result").append(row); 

        var noResults = document.createElement('div');
        $(noResults).addClass('cardRowItem');

        var noResultsP = document.createElement('p');
        noResultsP.textContent = "No results found!";

        noResults.append(noResultsP);

        row.append(noResults);

    }

    // fade in the results once all assigned
    $("#result-wrapper").fadeIn(500);

    // make the footer relative if the results sections is tall enough to prevent overlapping
    // also a very basic check to see if one's screen is of a different resolution and thus behave differently
    if (searchData.length > 3 || 
        (searchData.length <= 3 && $("#result").height() > 400 && $(window).width() * window.devicePixelRatio < 1920)) {
        $("#footer").addClass("relativeIt");
    }
    else {
        if ($("#footer").hasClass("relativeIt")) {
            $("#footer").removeClass("relativeIt");
        }
    }
}

// gracefully let the user know something went wrong
function handleError() {
    $("#statusMessage").text("Something went wrong, try again!");
    showStatus();
}

// fade in status (if something went wrong, if query was empty, etc.)
function showStatus() {
    $("#status").fadeIn(75, function() {
        setTimeout(function() {
            $("#status").fadeOut(400, function() {
                $("#statusMessage").text("No search data given!");
            });
        }, 1500);
    });
}

// try to setup voice recognition - doesn't work in Firefox
// if using Firefox, nothing is setup, and the microphone icon is hidden
function setupVoiceRecognition() {
    try {
        var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition || undefined;
        var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList || undefined;
        var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent || undefined;

        if (SpeechRecognition != undefined && SpeechGrammarList != undefined && SpeechRecognitionEvent != undefined) {
            var phrases = ['hearthfire', 'goblin', 'angel', 'beast', 'nephilim', 'animate']; 
            var grammar = '#JSGF V1.0; grammar phrases; public <phrase> = ' + phrases.join(' | ') + ' ;';

            var recognition = new SpeechRecognition();
            var speechRecognitionList = new SpeechGrammarList();

            speechRecognitionList.addFromString(grammar, 1);

            recognition.grammars = speechRecognitionList;
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            var speechTextElement = document.querySelector('#queryText');

            // when the microphone icon is clicked, begin vocal recognition
            $("#speech").click(function() {
                $(speechTextElement).attr("placeholder", "Begin speaking ...");
                recognition.start();
                //console.log("Ready to recieve a vocal query");
            });

            // when recognition gets a result, set the input field to the phrase recieved
            recognition.onresult = function(event) {
                var last = event.results.length - 1;
                var phrase =  event.results[last][0].transcript;
                //console.log(phrase);
                $(speechTextElement).val(phrase);
                //console.log("Confidence: " + event.results[0][0].confidence);
                $(speechTextElement).attr("placeholder", "ex: krosan cloudscraper");
            };

            // when speech ends, stop recognition
            recognition.onspeechend = function() {
                recognition.stop();
            };

            // speech recognition error handling
            recognition.onnomatch = function(event) {
                $(speechTextElement).attr("placeholder", "no recognized speech ...");

                setTimeout(function() {
                    $(speechTextElement).attr("placeholder", "ex: krosan cloudscraper");
                }, 1500);
            };

            recognition.onerror = function(event) {
                $(speechTextElement).attr("placeholder", "something went wrong ...");

                setTimeout(function() {
                    $(speechTextElement).attr("placeholder", "ex: krosan cloudscraper");
                }, 1500);
            };
        }
    }
    catch(error) {
        $("#speech").hide();
        return;    
    }
}

// when the document is ready
$(document).ready(function() {
    // page setup load, be certain the bg img is ready
    $("#background-image").ready(function() {
        // fade in bg img
        $('#background-image').animate({ opacity: 1 }, { duration: 500 });

        // fade in header elements, then slide in the search elements
        setTimeout(function() {
            // fade in logo and title
            $("#header").fadeIn(600, function() { 
                // slide down search box and submit button
                $("#search").slideDown(400, function() { 
                    // fade in footer (which is flex'd, which is why we're not using fadeIn)
                    $("#footer").animate({ opacity: 1 }, { duration: 400 }); 
                });
            });
        }, 600);
    });

    $("#about-help-button").click(function() {
        $("#about-help").slideDown(300);
    });

    $("#about-help").click(function() {
        $("#about-help").fadeOut(200);
    })

    // try and setup the voice recognition technology
    setupVoiceRecognition();

    // When submit is clicked (or Enter pressed), make a query
    $("#mtgSearchForm").submit(function(e) {
        // dynamically set the loader animation to be 10px below the submit button
        // called everytime as the user may have scrolled the page after a previous query
        var submitOffset = $("#querySubmit").offset().top - $(window).scrollTop();
        var loaderY = submitOffset + $("#querySubmit").outerHeight() + 10;
        $("#loader-wrapper").css("top", loaderY + "px");
        $("#status").css("top", loaderY + "px");

        // if no input given, let user know no input was given, and make no request
        if($("#queryText").val().length == 0) {
            // tell user that the query was empty
            showStatus();

            // do nothing and make sure the page doesn't change
            e.preventDefault();
            return false;
        }

        // set the footer to be back at the bottom of the viewport
        $("#footer").removeClass("relativeIt")

        // fade out any old query results
        $("#result-wrapper").fadeOut(350);



        // get form data for the AJAX request
        var action = $("#mtgSearchForm").attr("action");
        var query = encodeURIComponent($("#queryText").val());

        var data = $("#queryText").attr("name") + "=" + query;

        // show loading animation
        $("#loader-wrapper").show();

        // make ajax request
        $.ajax({
            cache: false,
            type: "get",
            url: action,
            data: data,
            dataType: "json",

            success: function(result, status, xhr) {
                // fade out the loader, then show the results of the search
                $("#loader-wrapper").fadeOut(200, setCards(result));
            },
            error: function(error, status, xhr) {
                // fade out the loader, then gracefully let user know something went wrong
                $("#loader-wrapper").fadeOut(200, handleError());
            }
        });

        // prevent page change
        e.preventDefault();
        return false;
    });
});