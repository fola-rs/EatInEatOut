"""
Self-contained predictor that loads checkpoint.pth and classifies a food image.
Works without the original training CSV – derives num_classes from the saved weights.
"""

import os
import torch
import torch.nn.functional as F
from torchvision import transforms, models
from PIL import Image

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_model = None
_class_names = None

_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

CHECKPOINT_PATH = os.path.join(os.path.dirname(__file__), "checkpoint.pth")

# Optional: path to the original training CSV for real class names.
# If missing, generic names ("class_0", "class_1", …) are used instead.
CSV_PATH = "C:/University_or_Work/AIApp Pictures/train/_classes.csv"


def _load_model():
    global _model, _class_names

    checkpoint = torch.load(CHECKPOINT_PATH, map_location=device)
    state = checkpoint["model_state_dict"]

    # Determine number of classes from the saved FC layer weights
    num_classes = state["fc.weight"].shape[0]

    # Build the same architecture used during training
    model = models.resnet18(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, num_classes)
    model.load_state_dict(state)
    model.to(device)
    model.eval()
    _model = model

    # Try to load real class names from the original CSV
    if os.path.exists(CSV_PATH):
        import pandas as pd
        df = pd.read_csv(CSV_PATH)
        _class_names = list(df.columns[1:])  # skip the filename column
    else:
        _class_names = [f"class_{i}" for i in range(num_classes)]


def predict(image_path: str):
    """Return (label, confidence) for the given image file."""
    global _model, _class_names
    if _model is None:
        _load_model()

    image = Image.open(image_path).convert("RGB")
    tensor = _transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = _model(tensor)
        probs = F.softmax(output, dim=1)
        pred_idx = output.argmax(1).item()
        confidence = probs[0, pred_idx].item()

    label = _class_names[pred_idx] if pred_idx < len(_class_names) else f"class_{pred_idx}"
    return label, confidence
