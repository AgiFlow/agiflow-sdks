from llm_mocks.llm.base import DataFactory


MODULE_NAME = "ImagesResponse"


class OpenAIImagesResponseFactory(DataFactory):
    """
    Data Factory to return OpenAI ImagesResponse response in stream or normal format
    """
    name = "ImagesResponse"
    data = DataFactory.load_default_data(__file__, MODULE_NAME)

    def get(self, override=None):
        data = OpenAIImagesResponseFactory.data
        if self.faker:
            data = {
                "data": [
                  {
                    "url": self.faker.url(),
                    "revised_prompt": self.faker.text()
                  }
                ]
            }

        return self.get_object_data(data, override=override)
