# Cat Gallery

## Overview

Cat Gallery is a web application that allows users to generate images based on prompts and retrieve descriptions of those images. The application utilizes Flask as the backend framework, Supabase for database management, and OpenAI's DALL-E model for image generation.

## Features

- Generate images from text prompts.
- Retrieve descriptions of generated images using Mistral.
- Store and display generated images along with their prompts and descriptions.
- Score the generated images based on user-defined criteria.
- Responsive design with a user-friendly interface.

## Technologies Used

- **Flask**: A lightweight WSGI web application framework in Python.
- **Supabase**: An open-source Firebase alternative that provides a backend as a service.
- **OpenAI**: For generating images using the DALL-E model.
- **Mistral**: For generating descriptions of images.
- **HTML/CSS**: For frontend development.
- **JavaScript**: For client-side interactivity.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/catgallery.git
   cd catgallery
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Create a `.env` file in the root directory and add your Supabase and API keys:
     ```bash
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_supabase_key
     MISTRAL_API_KEY=your_mistral_api_key
     CHIPP_API_KEY=your_chipp_api_key
     ```

5. Run the application:
   ```bash
   python app.py
   ```

6. Open your browser and go to `http://localhost:9000`.

## Usage

- On the main page, enter a prompt in the input field and click the send button to generate an image.
- The generated image will be displayed along with its description and score.
- You can view all generated images in the gallery.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Acknowledgments

- [Flask](https://flask.palletsprojects.com/)
- [Supabase](https://supabase.io/)
- [OpenAI](https://openai.com/)
- [Mistral](https://mistral.ai/)
