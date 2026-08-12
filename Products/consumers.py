import json

from channels.generic.websocket import (
    AsyncWebsocketConsumer
)


class BulkImportConsumer(
    AsyncWebsocketConsumer
):

    async def connect(self):

        self.import_id = (
            self.scope["url_route"]
            ["kwargs"]
            ["import_id"]
        )

        self.group_name = (
            f"bulk_import_{self.import_id}"
        )

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(
        self,
        close_code
    ):

        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def bulk_import_progress(
        self,
        event
    ):

        await self.send(
            text_data=json.dumps(
                {
                    "import_id":
                        event["import_id"],

                    "status":
                        event["status"],

                    "processed":
                        event["processed"],

                    "total":
                        event["total"],

                    "created":
                        event["created"],

                    "skipped":
                        event["skipped"],

                    "failed":
                        event["failed"],

                    "percentage":
                        event["percentage"]
                }
            )
        )