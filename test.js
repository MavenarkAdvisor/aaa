app.post("/api/ledger", async (req, res) => {
  try {
    // Fetch the required data
    const StockMasterV2raw = await stockmasterV2latestModel.find({}, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    const StockMasterV2 = StockMasterV2raw.map((doc) => doc.toObject({ getters: true, virtuals: false }));

    const StockMasterV3raw = await stockmasterV3latestModel.find({}, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    const StockMasterV3 = StockMasterV3raw.map((doc) => doc.toObject({ getters: true, virtuals: false }));

    const LedgerCoderaw = await ledgercodeModel.find({}, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    const LedgerCode = LedgerCoderaw.map((doc) => doc.toObject({ getters: true, virtuals: false }));

    const EntryTyperaw = await entrytypeModel.find({}, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    const EntryType = EntryTyperaw.map((doc) => doc.toObject({ getters: true, virtuals: false }));

    let Ledger = [];

    // Processing StockMasterV2
    StockMasterV2.forEach((itemV2) => {
      const {
        EventType, SettlementDate, ClientCode, SecurityCode, FaceValue, Amortisation,
        InterestAccrued, STT, Brokerage, TransactionCharges, TurnoverFees, ClearingCharges, GST, StampDuty
      } = itemV2;

      // Calculate CapitalGainLoss from StockMasterV3
      const CapitalGainLoss = StockMasterV3.find((itemV3) =>
        itemV2.SecurityCode === itemV3.SecurityCode &&
        itemV2.ClientCode === itemV3.ClientCode
      )?.CapitalGainLoss || 0;

      // Calculate AmortisationData
      const AmortisationData = StockMasterV3
        .filter(itemV3 => itemV2.SecurityCode === itemV3.SecurityCode &&
          itemV2.ClientCode === itemV3.ClientCode)
        .reduce((acc, itemV3) => acc + (itemV3.purchaseValue || 0), 0);

      const Date = SettlementDate;

      // Get the correct EntryType
      const entryTypeObj = EntryType.find((et) => et.EntryType === EventType);
      const Narration = entryTypeObj?.DefaultNarration;

      // Iterate over LedgerCode
      LedgerCode.forEach((itemLedger) => {
        const { LedgerCode, LedgerName } = itemLedger;
        let amount;

      // Calculate amount based on the EventType and LedgerCode
      if (EventType === "FI_PUR") {
        switch (LedgerCode) {
            case "A1000":
              amount = -(
                FaceValue + Amortisation + InterestAccrued + StampDuty +
                Brokerage + TransactionCharges + TurnoverFees + ClearingCharges + GST + STT
              );
              break;
            case "A1001": amount = FaceValue; break;
            case "A1003": amount = Amortisation; break;
            case "A1005": amount = InterestAccrued; break;
            case "A1009": amount = StampDuty; break;
            case "E1010": amount = Brokerage; break;
            case "E1011": amount = TransactionCharges; break;
            case "E1012": amount = TurnoverFees; break;
            case "E1013": amount = ClearingCharges; break;
            case "E1014": amount = GST; break;
            case "E1015": amount = STT; break;
            default: amount = null;
          }
      } else if (EventType === "FI_SAL") {
      switch (LedgerCode) {
            case "A1000":
              amount = FaceValue + Amortisation + InterestAccrued + StampDuty +
                Brokerage + TransactionCharges + TurnoverFees + ClearingCharges + GST + STT;
              break;
            case "A1001": amount = -FaceValue; break;
            case "A1003": amount = -AmortisationData; break;
            case "A1005": amount = -InterestAccrued; break;
            case "E1009": amount = -StampDuty; break;
            case "E1010": amount = -Brokerage; break;
            case "E1011": amount = -TransactionCharges; break;
            case "E1012": amount = -TurnoverFees; break;
            case "E1013": amount = -ClearingCharges; break;
            case "E1014": amount = -GST; break;
            case "E1015": amount = -STT; break;
            case "I1007": amount = -CapitalGainLoss; break;
            default: amount = null;
          }
        }

        const CrDr = amount > 0 ? "D" : amount < 0 ? "C" : "";

        if (amount !== null && amount !== undefined) {
          Ledger.push({
            EventType, LedgerCode, ClientCode, Date, SecurityCode,
            Amount: amount, LedgerName, CrDr, Narration,
          });
        }
      });
    });
    // console.log(Ledger);

    const duplicatesledger = await Promise.all(
      Ledger.map(async (data, i) => {
        const res = await ledgerModel.findOne({ Date: data.Date });
        if (res) return true;
        else {
          return false;
        }
      })
    );

    const uniqueledgerresult = await Promise.all(
      Ledger.map(async (data, i) => {
        if (!duplicatesledger[i]) {
          return data;
        }
      })
    );

    const updateduniqueledger = uniqueledgerresult.filter((obj) => obj);

    await ledgerModel.insertMany(updateduniqueledger);

    res.status(200).json({ status: true, message: "Ledger Calculated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
});
