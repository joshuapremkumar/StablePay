from celery import Celery

from backend.shared.utils.config import settings

celery_app = Celery(
    "stablepay",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "backend.services.treasury.src.tasks",
        "backend.services.payments.src.tasks",
        "backend.services.trade.src.tasks",
        "backend.services.compliance.src.tasks",
        "backend.services.scoring.src.tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    task_soft_time_limit=25 * 60,
    worker_max_tasks_per_child=200,
)


@celery_app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
