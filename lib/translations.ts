export type Language = "en" | "ka";

export interface Translations {
  // Common
  common: {
    back: string;
    cancel: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    submit: string;
    continue: string;
    retry: string;
  };

  // App branding
  app: {
    name: string;
    tagline: string;
    walletConnected: string;
  };

  // Authentication
  auth: {
    welcome: string;
    welcomeDescription: string;
    fullName: string;
    emailAddress: string;
    enterFullName: string;
    enterEmail: string;
    createAccount: string;
    creatingAccount: string;
    walletInfo: string;
    earnInfo: string;
    registrationFailed: string;
    networkError: string;
  };

  // Home page
  home: {
    findBins: string;
    findBinsDescription: string;
    viewMap: string;
    quickDrop: string;
    quickDropDescription: string;
    startDrop: string;
    readyToMakeDifference: string;
    earnCardanoRewards: string;
    availableInZugdidi: string;
  };

  // Map view
  map: {
    recyclingBins: string;
    findNearest: string;
    myLocation: string;
    locating: string;
    interactiveMap: string;
    showingBins: string;
    yourLocation: string;
    availableBins: string;
    totalDrops: string;
    distance: string;
    coordinates: string;
    selectedBin: string;
    readyToStart: string;
    startDropProcess: string;
    instructions: string;
    instructionSteps: string[];
  };

  // Drop process
  drop: {
    dropProcess: string;
    stepOf: string;
    scanQR: string;
    scanQRDescription: string;
    pointCamera: string;
    expectedQR: string;
    simulateQRScan: string;
    scanning: string;
    qrScanned: string;
    takePhoto: string;
    takePhotoDescription: string;
    startCamera: string;
    capturePhoto: string;
    selectItem: string;
    selectItemDescription: string;
    confirmDrop: string;
    reviewDetails: string;
    binLocation: string;
    itemType: string;
    estimatedReward: string;
    photo: string;
    submitAndEarn: string;
    submittingDrop: string;
    youAreHero: string;
    dropSuccessDescription: string;
    rewardEarned: string;
    rewardProcessing: string;
    returnHome: string;
  };

  // Item types
  items: {
    smartphone: string;
    laptop: string;
    phoneCharger: string;
    headphones: string;
    tablet: string;
    other: string;
    usbCable: string;
    laptopCharger: string;
    hdmiCable: string;
    audioCable: string;
    earbuds: string;
    bluetoothSpeaker: string;
    computerMouse: string;
    keyboard: string;
    remoteControl: string;
    calculator: string;
    basicPhone: string;
    smartwatch: string;
    fitnessTracker: string;
    portableSpeaker: string;
    gamingController: string;
    desktopComputer: string;
    monitor: string;
    printer: string;
    phoneBattery: string;
    laptopBattery: string;
    powerBank: string;
    carBattery: string;
    upsBattery: string;
  };

  // Locations
  locations: {
    kikalisviliBin: string;
    kikalisviliAddress: string;
    tradeCenterMall: string;
    tradeCenterAddress: string;
  };

  // Rewards
  rewards: {
    cablesChargers: string;
    smallElectronics: string;
    mediumElectronics: string;
    largeElectronics: string;
    batteriesHazardous: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      back: "Back",
      cancel: "Cancel",
      confirm: "Confirm",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      submit: "Submit",
      continue: "Continue",
      retry: "Retry",
    },
    app: {
      name: "Reloop",
      tagline: "Recycle & Earn",
      walletConnected: "Wallet Connected",
    },
    auth: {
      welcome: "Welcome to Reloop",
      welcomeDescription:
        "Join the e-waste recycling revolution and earn Cardano rewards",
      fullName: "Full Name",
      emailAddress: "Email Address",
      enterFullName: "Enter your full name",
      enterEmail: "Enter your email",
      createAccount: "Create Account & Wallet",
      creatingAccount: "Creating Account...",
      walletInfo: "A Cardano wallet will be automatically created for you",
      earnInfo: "Start earning ADA by recycling e-waste!",
      registrationFailed: "Registration failed",
      networkError: "Network error. Please try again.",
    },
    home: {
      findBins: "Find Recycling Bins",
      findBinsDescription:
        "Locate the nearest e-waste recycling bin in Zugdidi",
      viewMap: "View Map",
      quickDrop: "Quick Drop",
      quickDropDescription: "Scan QR code and drop your e-waste to earn ADA",
      startDrop: "Start Drop",
      readyToMakeDifference: "Ready to make a difference?",
      earnCardanoRewards: "Drop your e-waste and earn Cardano rewards!",
      availableInZugdidi: "Available in Zugdidi",
    },
    map: {
      recyclingBins: "Recycling Bins",
      findNearest:
        "Find the nearest recycling bin and start earning ADA rewards",
      myLocation: "My Location",
      locating: "Locating...",
      interactiveMap: "Interactive Map",
      showingBins: "Showing {count} active recycling bins in Zugdidi",
      yourLocation: "Your location",
      availableBins: "Available Bins",
      totalDrops: "Total drops",
      distance: "Distance",
      coordinates: "Coordinates",
      selectedBin: "Selected Bin",
      readyToStart: "Ready to start recycling?",
      startDropProcess: "Start Drop Process",
      instructions: "Instructions:",
      instructionSteps: [
        "1. Go to the selected bin location",
        "2. Scan the QR code on the bin",
        "3. Take a photo of your e-waste item",
        "4. Select the item type and earn ADA rewards!",
      ],
    },
    drop: {
      dropProcess: "Drop Process",
      stepOf: "Step",
      scanQR: "Scan QR Code",
      scanQRDescription: "Scan the QR code on the recycling bin",
      pointCamera: "Point camera at QR code",
      expectedQR: "Expected QR",
      simulateQRScan: "Simulate QR Scan",
      scanning: "Scanning...",
      qrScanned: "QR Code scanned successfully!",
      takePhoto: "Take Photo",
      takePhotoDescription:
        "Take a clear photo of the e-waste item you're dropping",
      startCamera: "Start Camera",
      capturePhoto: "Capture Photo",
      selectItem: "Select Item Type",
      selectItemDescription: "What type of e-waste are you dropping?",
      confirmDrop: "Confirm Drop",
      reviewDetails: "Review your drop details before submitting",
      binLocation: "Bin Location:",
      itemType: "Item Type:",
      estimatedReward: "Estimated Reward:",
      photo: "Photo:",
      submitAndEarn: "Submit Drop & Earn Reward",
      submittingDrop: "Submitting Drop...",
      youAreHero: "You are a hero!",
      dropSuccessDescription:
        "Your e-waste drop has been successfully submitted",
      rewardEarned: "Reward Earned",
      rewardProcessing:
        "Your reward will be processed and added to your Cardano wallet shortly.",
      returnHome: "Return to Home",
    },
    items: {
      smartphone: "Smartphone",
      laptop: "Laptop",
      phoneCharger: "Phone Charger",
      headphones: "Headphones",
      tablet: "Tablet",
      other: "Other",
      usbCable: "USB Cable",
      laptopCharger: "Laptop Charger",
      hdmiCable: "HDMI Cable",
      audioCable: "Audio Cable",
      earbuds: "Earbuds",
      bluetoothSpeaker: "Bluetooth Speaker",
      computerMouse: "Computer Mouse",
      keyboard: "Keyboard",
      remoteControl: "Remote Control",
      calculator: "Calculator",
      basicPhone: "Basic Phone",
      smartwatch: "Smartwatch",
      fitnessTracker: "Fitness Tracker",
      portableSpeaker: "Portable Speaker",
      gamingController: "Gaming Controller",
      desktopComputer: "Desktop Computer",
      monitor: "Monitor",
      printer: "Printer",
      phoneBattery: "Phone Battery",
      laptopBattery: "Laptop Battery",
      powerBank: "Power Bank",
      carBattery: "Car Battery",
      upsBattery: "UPS Battery",
    },
    locations: {
      kikalisviliBin: "Kikalisvili Bin",
      kikalisviliAddress: "Kikalisvili 6, Zugdidi 2100",
      tradeCenterMall: "Trade Center Mall",
      tradeCenterAddress: "28 Merab Kostava St, Zugdidi 2100",
    },
    rewards: {
      cablesChargers: "Cables & Chargers (1 ADA)",
      smallElectronics: "Small Electronics (1.5 ADA)",
      mediumElectronics: "Medium Electronics (3 ADA)",
      largeElectronics: "Large Electronics (5 ADA)",
      batteriesHazardous: "Batteries & Hazardous (7 ADA)",
    },
  },
  ka: {
    common: {
      back: "უკან",
      cancel: "გაუქმება",
      confirm: "დადასტურება",
      loading: "იტვირთება...",
      error: "შეცდომა",
      success: "წარმატება",
      submit: "გაგზავნა",
      continue: "გაგრძელება",
      retry: "ხელახლა",
    },
    app: {
      name: "Reloop",
      tagline: "გადამუშავება და შემოსავალი",
      walletConnected: "საფულე დაკავშირებულია",
    },
    auth: {
      welcome: "კეთილი იყოს თქვენი მობრძანება Reloop-ში",
      welcomeDescription:
        "შეუერთდით ელექტრონული ნარჩენების გადამუშავების რევოლუციას და მიიღეთ Cardano ჯილდოები",
      fullName: "სრული სახელი",
      emailAddress: "ელ-ფოსტის მისამართი",
      enterFullName: "შეიყვანეთ თქვენი სრული სახელი",
      enterEmail: "შეიყვანეთ თქვენი ელ-ფოსტა",
      createAccount: "ანგარიშისა და საფულის შექმნა",
      creatingAccount: "ანგარიში იქმნება...",
      walletInfo: "Cardano საფულე ავტომატურად შეიქმნება თქვენთვის",
      earnInfo: "დაიწყეთ ADA-ს მიღება ელექტრონული ნარჩენების გადამუშავებით!",
      registrationFailed: "რეგისტრაცია ვერ მოხერხდა",
      networkError: "ქსელის შეცდომა. გთხოვთ სცადოთ ხელახლა.",
    },
    home: {
      findBins: "გადამუშავების ურნების პოვნა",
      findBinsDescription:
        "იპოვეთ უახლოესი ელექტრონული ნარჩენების გადამუშავების ურნა ზუგდიდში",
      viewMap: "რუკის ნახვა",
      quickDrop: "სწრაფი ჩაგდება",
      quickDropDescription:
        "დაასკანირეთ QR კოდი და ჩაგდეთ ელექტრონული ნარჩენები ADA-ს მისაღებად",
      startDrop: "ჩაგდების დაწყება",
      readyToMakeDifference: "მზად ხართ ცვლილებისთვის?",
      earnCardanoRewards:
        "ჩაგდეთ ელექტრონული ნარჩენები და მიიღეთ Cardano ჯილდოები!",
      availableInZugdidi: "ხელმისაწვდომია ზუგდიდში",
    },
    map: {
      recyclingBins: "გადამუშავების ურნები",
      findNearest:
        "იპოვეთ უახლოესი გადამუშავების ურნა და დაიწყეთ ADA ჯილდოების მიღება",
      myLocation: "ჩემი მდებარეობა",
      locating: "მდებარეობის განსაზღვრა...",
      interactiveMap: "ინტერაქტიული რუკა",
      showingBins: "ნაჩვენებია {count} აქტიური გადამუშავების ურნა ზუგდიდში",
      yourLocation: "თქვენი მდებარეობა",
      availableBins: "ხელმისაწვდომი ურნები",
      totalDrops: "სულ ჩაგდებული",
      distance: "მანძილი",
      coordinates: "კოორდინატები",
      selectedBin: "არჩეული ურნა",
      readyToStart: "მზად ხართ გადამუშავების დასაწყებად?",
      startDropProcess: "ჩაგდების პროცესის დაწყება",
      instructions: "ინსტრუქციები:",
      instructionSteps: [
        "1. წადით არჩეული ურნის მდებარეობაზე",
        "2. დაასკანირეთ QR კოდი ურნაზე",
        "3. გადაუღეთ ფოტო თქვენს ელექტრონულ ნარჩენს",
        "4. აირჩიეთ ნივთის ტიპი და მიიღეთ ADA ჯილდოები!",
      ],
    },
    drop: {
      dropProcess: "ჩაგდების პროცესი",
      stepOf: "ნაბიჯი",
      scanQR: "QR კოდის სკანირება",
      scanQRDescription: "დაასკანირეთ QR კოდი გადამუშავების ურნაზე",
      pointCamera: "მიმართეთ კამერა QR კოდისკენ",
      expectedQR: "მოსალოდნელი QR",
      simulateQRScan: "QR სკანირების სიმულაცია",
      scanning: "სკანირება...",
      qrScanned: "QR კოდი წარმატებით დასკანირდა!",
      takePhoto: "ფოტოს გადაღება",
      takePhotoDescription:
        "გადაუღეთ მკაფიო ფოტო ელექტრონულ ნარჩენს, რომელსაც აგდებთ",
      startCamera: "კამერის ჩართვა",
      capturePhoto: "ფოტოს გადაღება",
      selectItem: "ნივთის ტიპის არჩევა",
      selectItemDescription: "რა ტიპის ელექტრონულ ნარჩენს აგდებთ?",
      confirmDrop: "ჩაგდების დადასტურება",
      reviewDetails: "გადახედეთ ჩაგდების დეტალებს გაგზავნამდე",
      binLocation: "ურნის მდებარეობა:",
      itemType: "ნივთის ტიპი:",
      estimatedReward: "სავარაუდო ჯილდო:",
      photo: "ფოტო:",
      submitAndEarn: "ჩაგდება და ჯილდოს მიღება",
      submittingDrop: "ჩაგდება იგზავნება...",
      youAreHero: "თქვენ ხართ გმირი!",
      dropSuccessDescription:
        "თქვენი ელექტრონული ნარჩენების ჩაგდება წარმატებით გაიგზავნა",
      rewardEarned: "მიღებული ჯილდო",
      rewardProcessing:
        "თქვენი ჯილდო დამუშავდება და მალე დაემატება თქვენს Cardano საფულეს.",
      returnHome: "მთავარ გვერდზე დაბრუნება",
    },
    items: {
      smartphone: "სმარტფონი",
      laptop: "ლეპტოპი",
      phoneCharger: "ტელეფონის დამტენი",
      headphones: "ყურსასმენი",
      tablet: "ტაბლეტი",
      other: "სხვა",
      usbCable: "USB კაბელი",
      laptopCharger: "ლეპტოპის დამტენი",
      hdmiCable: "HDMI კაბელი",
      audioCable: "აუდიო კაბელი",
      earbuds: "ყურსასმენი",
      bluetoothSpeaker: "Bluetooth დინამიკი",
      computerMouse: "კომპიუტერის მაუსი",
      keyboard: "კლავიატურა",
      remoteControl: "დისტანციური მართვა",
      calculator: "კალკულატორი",
      basicPhone: "ჩვეულებრივი ტელეფონი",
      smartwatch: "სმარტ საათი",
      fitnessTracker: "ფიტნეს ტრეკერი",
      portableSpeaker: "პორტატული დინამიკი",
      gamingController: "თამაშის კონტროლერი",
      desktopComputer: "დესკტოპ კომპიუტერი",
      monitor: "მონიტორი",
      printer: "პრინტერი",
      phoneBattery: "ტელეფონის ბატარეა",
      laptopBattery: "ლეპტოპის ბატარეა",
      powerBank: "Power Bank",
      carBattery: "მანქანის ბატარეა",
      upsBattery: "UPS ბატარეა",
    },
    locations: {
      kikalisviliBin: "კიკალიშვილის ბინი",
      kikalisviliAddress: "კიკალიშვილის 6, ზუგდიდი 2100",
      tradeCenterMall: "Trade Center Mall",
      tradeCenterAddress: "28 მერაბ კოსტავას ქ., ზუგდიდი 2100",
    },
    rewards: {
      cablesChargers: "კაბელები და დამტენები (1 ADA)",
      smallElectronics: "მცირე ელექტრონიკა (1.5 ADA)",
      mediumElectronics: "საშუალო ელექტრონიკა (3 ADA)",
      largeElectronics: "დიდი ელექტრონიკა (5 ADA)",
      batteriesHazardous: "ბატარეები და საშიში (7 ADA)",
    },
  },
};
