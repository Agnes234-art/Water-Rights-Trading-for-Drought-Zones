;; title: Water-Right-Trading
;; Note: Block height functionality temporarily simplified for compatibility

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INVALID_AMOUNT (err u101))
(define-constant ERR_INSUFFICIENT_BALANCE (err u102))
(define-constant ERR_INVALID_PRICE (err u103))
(define-constant ERR_INVALID_ALLOCATION (err u104))
(define-constant ERR_LISTING_NOT_FOUND (err u105))
(define-constant ERR_CANNOT_BUY_OWN_LISTING (err u106))
(define-constant ERR_INVALID_EXPIRY (err u107))
(define-constant ERR_LISTING_EXPIRED (err u108))
(define-constant ERR_ALLOCATION_NOT_FOUND (err u109))
(define-constant ERR_INVALID_REGION (err u110))

(define-map water-allocations
  { owner: principal }
  { 
    total-allocation: uint,
    available-balance: uint,
    region: (string-ascii 50),
    allocation-date: uint,
    expiry-date: uint
  }
)

(define-map water-listings
  { listing-id: uint }
  {
    seller: principal,
    amount: uint,
    price-per-unit: uint,
    region: (string-ascii 50),
    expiry-block: uint,
    active: bool
  }
)

(define-map user-statistics
  { user: principal }
  {
    total-sold: uint,
    total-bought: uint,
    total-earned: uint,
    total-spent: uint,
    trades-count: uint
  }
)

(define-map region-statistics
  { region: (string-ascii 50) }
  {
    total-volume: uint,
    total-trades: uint,
    average-price: uint,
    active-listings: uint
  }
)

(define-data-var next-listing-id uint u1)
(define-data-var total-allocations uint u0)
(define-data-var total-trades uint u0)
(define-data-var total-volume uint u0)
(define-data-var platform-fee-rate uint u25)

(define-read-only (get-water-allocation (owner principal))
  (map-get? water-allocations { owner: owner })
)

(define-read-only (get-water-listing (listing-id uint))
  (map-get? water-listings { listing-id: listing-id })
)

(define-read-only (get-user-statistics (user principal))
  (default-to 
    { total-sold: u0, total-bought: u0, total-earned: u0, total-spent: u0, trades-count: u0 }
    (map-get? user-statistics { user: user })
  )
)

(define-read-only (get-region-statistics (region (string-ascii 50)))
  (default-to 
    { total-volume: u0, total-trades: u0, average-price: u0, active-listings: u0 }
    (map-get? region-statistics { region: region })
  )
)

(define-read-only (get-platform-statistics)
  {
    total-allocations: (var-get total-allocations),
    total-trades: (var-get total-trades),
    total-volume: (var-get total-volume),
    platform-fee-rate: (var-get platform-fee-rate)
  }
)

(define-read-only (get-next-listing-id)
  (var-get next-listing-id)
)

(define-read-only (calculate-platform-fee (amount uint))
  (/ (* amount (var-get platform-fee-rate)) u10000)
)

(define-read-only (is-listing-active (listing-id uint))
  (match (get-water-listing listing-id)
    listing (and 
              (get active listing)
              true
            )
    false
  )
)

(define-read-only (get-available-balance (owner principal))
  (match (get-water-allocation owner)
    allocation (get available-balance allocation)
    u0
  )
)

(define-public (register-water-allocation (total-allocation uint) (region (string-ascii 50)) (expiry-date uint))
  (let ((current-block u1))
    (asserts! (> total-allocation u0) ERR_INVALID_AMOUNT)
    (asserts! (> expiry-date current-block) ERR_INVALID_EXPIRY)
    (asserts! (> (len region) u0) ERR_INVALID_REGION)
    
    (map-set water-allocations
      { owner: tx-sender }
      {
        total-allocation: total-allocation,
        available-balance: total-allocation,
        region: region,
        allocation-date: current-block,
        expiry-date: expiry-date
      }
    )
    
    (var-set total-allocations (+ (var-get total-allocations) u1))
    (ok total-allocation)
  )
)

(define-public (create-listing (amount uint) (price-per-unit uint) (expiry-blocks uint))
  (let (
    (listing-id (var-get next-listing-id))
    (current-block u1)
    (allocation (unwrap! (get-water-allocation tx-sender) ERR_ALLOCATION_NOT_FOUND))
    (expiry-block (+ current-block expiry-blocks))
  )
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> price-per-unit u0) ERR_INVALID_PRICE)
    (asserts! (> expiry-blocks u0) ERR_INVALID_EXPIRY)
    (asserts! (>= (get available-balance allocation) amount) ERR_INSUFFICIENT_BALANCE)
    
    (map-set water-listings
      { listing-id: listing-id }
      {
        seller: tx-sender,
        amount: amount,
        price-per-unit: price-per-unit,
        region: (get region allocation),
        expiry-block: expiry-block,
        active: true
      }
    )
    
    (map-set water-allocations
      { owner: tx-sender }
      (merge allocation { available-balance: (- (get available-balance allocation) amount) })
    )
    
    (update-region-statistics (get region allocation) u0 u1 u0 1)
    (var-set next-listing-id (+ listing-id u1))
    (ok listing-id)
  )
)

(define-public (buy-water-rights (listing-id uint))
  (let (
    (listing (unwrap! (get-water-listing listing-id) ERR_LISTING_NOT_FOUND))
    (seller (get seller listing))
    (amount (get amount listing))
    (price-per-unit (get price-per-unit listing))
    (total-cost (* amount price-per-unit))
    (platform-fee (calculate-platform-fee total-cost))
    (seller-amount (- total-cost platform-fee))
    (buyer-allocation (get-water-allocation tx-sender))
    (seller-allocation (unwrap! (get-water-allocation seller) ERR_ALLOCATION_NOT_FOUND))
    (region (get region listing))
  )
    (asserts! (is-listing-active listing-id) ERR_LISTING_EXPIRED)
    (asserts! (not (is-eq tx-sender seller)) ERR_CANNOT_BUY_OWN_LISTING)
    
    (try! (stx-transfer? total-cost tx-sender seller))
    (if (> platform-fee u0)
      (try! (stx-transfer? platform-fee seller CONTRACT_OWNER))
      true
    )
    
    (match buyer-allocation
      existing-allocation (map-set water-allocations
        { owner: tx-sender }
        (merge existing-allocation { 
          available-balance: (+ (get available-balance existing-allocation) amount),
          total-allocation: (+ (get total-allocation existing-allocation) amount)
        })
      )
      (map-set water-allocations
        { owner: tx-sender }
        {
          total-allocation: amount,
          available-balance: amount,
          region: region,
          allocation-date: u1,
          expiry-date: (get expiry-date seller-allocation)
        }
      )
    )
    
    (map-set water-listings
      { listing-id: listing-id }
      (merge listing { active: false })
    )
    
    (update-user-statistics tx-sender u0 amount u0 total-cost u1)
    (update-user-statistics seller amount u0 seller-amount u0 u1)
    (update-region-statistics region amount u1 price-per-unit 0)
    
    (var-set total-trades (+ (var-get total-trades) u1))
    (var-set total-volume (+ (var-get total-volume) amount))
    
    (ok { 
      amount: amount, 
      total-cost: total-cost, 
      platform-fee: platform-fee,
      seller: seller
    })
  )
)

(define-public (cancel-listing (listing-id uint))
  (let (
    (listing (unwrap! (get-water-listing listing-id) ERR_LISTING_NOT_FOUND))
    (seller (get seller listing))
    (amount (get amount listing))
    (allocation (unwrap! (get-water-allocation tx-sender) ERR_ALLOCATION_NOT_FOUND))
    (region (get region listing))
  )
    (asserts! (is-eq tx-sender seller) ERR_UNAUTHORIZED)
    (asserts! (get active listing) ERR_LISTING_NOT_FOUND)
    
    (map-set water-listings
      { listing-id: listing-id }
      (merge listing { active: false })
    )
    
    (map-set water-allocations
      { owner: tx-sender }
      (merge allocation { available-balance: (+ (get available-balance allocation) amount) })
    )
    
    (update-region-statistics region u0 u0 u0 0)
    (ok amount)
  )
)

(define-public (transfer-water-rights (recipient principal) (amount uint))
  (let (
    (sender-allocation (unwrap! (get-water-allocation tx-sender) ERR_ALLOCATION_NOT_FOUND))
    (recipient-allocation (get-water-allocation recipient))
    (region (get region sender-allocation))
    (expiry-date (get expiry-date sender-allocation))
  )
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (>= (get available-balance sender-allocation) amount) ERR_INSUFFICIENT_BALANCE)
    
    (map-set water-allocations
      { owner: tx-sender }
      (merge sender-allocation { 
        available-balance: (- (get available-balance sender-allocation) amount),
        total-allocation: (- (get total-allocation sender-allocation) amount)
      })
    )
    
    (match recipient-allocation
      existing-allocation (map-set water-allocations
        { owner: recipient }
        (merge existing-allocation { 
          available-balance: (+ (get available-balance existing-allocation) amount),
          total-allocation: (+ (get total-allocation existing-allocation) amount)
        })
      )
      (map-set water-allocations
        { owner: recipient }
        {
          total-allocation: amount,
          available-balance: amount,
          region: region,
          allocation-date: u1,
          expiry-date: expiry-date
        }
      )
    )
    
    (ok amount)
  )
)

(define-public (set-platform-fee-rate (new-rate uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (<= new-rate u1000) ERR_INVALID_AMOUNT)
    (var-set platform-fee-rate new-rate)
    (ok new-rate)
  )
)

(define-private (update-user-statistics (user principal) (sold uint) (bought uint) (earned uint) (spent uint) (trades uint))
  (let ((current-stats (get-user-statistics user)))
    (map-set user-statistics
      { user: user }
      {
        total-sold: (+ (get total-sold current-stats) sold),
        total-bought: (+ (get total-bought current-stats) bought),
        total-earned: (+ (get total-earned current-stats) earned),
        total-spent: (+ (get total-spent current-stats) spent),
        trades-count: (+ (get trades-count current-stats) trades)
      }
    )
  )
)

(define-private (update-region-statistics (region (string-ascii 50)) (volume uint) (trades uint) (price uint) (listing-change int))
  (let ((current-stats (get-region-statistics region)))
    (map-set region-statistics
      { region: region }
      {
        total-volume: (+ (get total-volume current-stats) volume),
        total-trades: (+ (get total-trades current-stats) trades),
        average-price: (if (> trades u0) 
                        (/ (+ (* (get average-price current-stats) (get total-trades current-stats)) price) 
                           (+ (get total-trades current-stats) trades))
                        (get average-price current-stats)),
        active-listings: (if (>= listing-change 0)
                          (+ (get active-listings current-stats) (to-uint listing-change))
                          (if (>= (get active-listings current-stats) (to-uint (- listing-change)))
                            (- (get active-listings current-stats) (to-uint (- listing-change)))
                            u0))
      }
    )
  )
)
