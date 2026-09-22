# Machine Learning Technical Reference

## Supervised Learning and Classification
Supervised learning algorithms map input feature vectors $X$ to target labels $y$ using labeled training data. Logistic Regression models log-odds probabilities using sigmoid or softmax functions. Metrics include Precision, Recall, F1-Score, ROC-AUC, and Confusion Matrix.

## Feature Engineering and Normalization
Raw data is transformed into numerical feature vectors through scaling (StandardScaler, MinMaxScaler), categorical encoding (One-Hot, Target Encoding), and text vectorization (TF-IDF, dense embeddings). Normalization prevents features with large numeric scales from dominating model optimization gradients.

## Overfitting and Regularization
Overfitting occurs when a model memorizes training noise rather than generalizing to unseen data. Regularization techniques penalize complex weights (L1 Lasso for feature selection, L2 Ridge for weight shrinkage, Dropout in deep learning).

## Embeddings and Vector Search
Sentence Transformer models encode unstructured text into dense vector representations where semantic similarity corresponds to cosine distance or inner product. Vector indexes (FAISS) enable fast approximate nearest neighbor (ANN) retrieval over large embedding collections.
