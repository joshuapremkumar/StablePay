from fastapi import APIRouter

from src.demo_state import demo_store

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_demo():
    return demo_store.snapshot("dashboard")


@router.get("/payments")
async def get_payments_demo():
    return demo_store.snapshot("payments")


@router.get("/treasury")
async def get_treasury_demo():
    return demo_store.snapshot("treasury")


@router.get("/trade")
async def get_trade_demo():
    return demo_store.snapshot("trade")


@router.get("/compliance")
async def get_compliance_demo():
    return demo_store.snapshot("compliance")


@router.post("/actions/payment-link")
async def create_payment_link():
    return demo_store.create_payment_link()


@router.post("/actions/payment")
async def simulate_payment():
    return demo_store.simulate_payment()


@router.post("/actions/payout")
async def create_payout():
    return demo_store.create_payout()


@router.post("/actions/screen")
async def screen_entity(payload: dict):
    entity_name = payload.get("entity_name", "Demo Counterparty")
    return demo_store.screen_entity(entity_name)


@router.post("/actions/financing")
async def request_financing():
    return demo_store.request_financing()
